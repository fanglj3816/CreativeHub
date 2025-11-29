package com.creativehub.media.service.impl;

import com.creativehub.common.core.dto.MediaDTO;
import com.creativehub.media.config.MinioProperties;
import com.creativehub.media.entity.MediaFile;
import com.creativehub.media.exception.MediaUploadException;
import com.creativehub.media.repository.MediaFileRepository;
import com.creativehub.media.service.MediaFileService;
import com.creativehub.media.util.FFmpegExecutor;
import com.creativehub.media.util.FFprobeUtil;
import com.creativehub.media.util.MediaMeta;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaFileServiceImpl implements MediaFileService {

    private static final Logger log = LoggerFactory.getLogger(MediaFileServiceImpl.class);
    private static final DateTimeFormatter PATH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final String TEMP_DIR = "/tmp/media_upload";
    
    // 需要转码的视频格式（不包含 mp4）
    private static final Set<String> TRANSCODE_VIDEO_FORMATS = Set.of(
        "mov", "mkv", "avi", "hevc", "flv", "wmv", "m4v", "3gp"
    );
    
    // 支持的 MP4 格式（H.264 + AAC，无需转码）
    private static final Set<String> SUPPORTED_VIDEO_FORMATS = Set.of("mp4");

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    private final MediaFileRepository mediaFileRepository;
    private final FFmpegExecutor ffmpegExecutor;
    private final FFprobeUtil ffprobeUtil;

    public MediaFileServiceImpl(MinioClient minioClient,
                                MinioProperties minioProperties,
                                MediaFileRepository mediaFileRepository,
                                FFmpegExecutor ffmpegExecutor,
                                FFprobeUtil ffprobeUtil) {
        this.minioClient = minioClient;
        this.minioProperties = minioProperties;
        this.mediaFileRepository = mediaFileRepository;
        this.ffmpegExecutor = ffmpegExecutor;
        this.ffprobeUtil = ffprobeUtil;
        
        // 确保临时目录存在
        ensureTempDir();
    }
    
    private void ensureTempDir() {
        try {
            Path tempPath = Paths.get(TEMP_DIR);
            if (!Files.exists(tempPath)) {
                Files.createDirectories(tempPath);
                log.info("创建临时目录: {}", TEMP_DIR);
            }
        } catch (Exception e) {
            log.warn("创建临时目录失败: {}", TEMP_DIR, e);
        }
    }

    @Override
    @Transactional
    public UploadResponse uploadMedia(MultipartFile file, Long ownerId) {
        if (file == null || file.isEmpty()) {
            throw new MediaUploadException("上传文件不能为空");
        }
        if (ownerId == null) {
            throw new MediaUploadException("无法识别上传用户");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new MediaUploadException("文件名不能为空");
        }

        String mimeType = file.getContentType();
        String fileType = resolveFileType(mimeType);
        String fileExtension = StringUtils.getFilenameExtension(originalFilename);
        String normalizedExt = StringUtils.hasText(fileExtension) 
            ? fileExtension.toLowerCase(Locale.ROOT) 
            : "";

        File tempInputFile = null;
        File tempOutputFile = null;
        File finalFile = null;

        try {
            // 1. 保存文件到临时目录
            String tempInputPath = TEMP_DIR + "/" + UUID.randomUUID() + "." + normalizedExt;
            tempInputFile = new File(tempInputPath);
            tempInputFile.getParentFile().mkdirs();
            file.transferTo(tempInputFile);
            log.info("文件已保存到临时目录: {}", tempInputPath);

            // 2. 判断是否需要转码（仅对视频文件）
            boolean needTranscode = false;
            if ("VIDEO".equals(fileType)) {
                if (TRANSCODE_VIDEO_FORMATS.contains(normalizedExt)) {
                    needTranscode = true;
                    log.info("检测到需要转码的视频格式: {}", normalizedExt);
                } else if (SUPPORTED_VIDEO_FORMATS.contains(normalizedExt)) {
                    log.info("视频格式已兼容，无需转码: {}", normalizedExt);
                } else {
                    log.warn("未知的视频格式: {}，尝试直接上传", normalizedExt);
                }
            }

            // 3. 如果需要转码，执行转码
            if (needTranscode) {
                String tempOutputPath = TEMP_DIR + "/" + UUID.randomUUID() + ".mp4";
                tempOutputFile = new File(tempOutputPath);
                
                if (!ffmpegExecutor.isAvailable()) {
                    throw new MediaUploadException("FFmpeg 不可用，无法进行视频转码");
                }

                log.info("开始转码: {} -> {}", tempInputPath, tempOutputPath);
                boolean transcodeSuccess = ffmpegExecutor.transcodeToMp4(
                    tempInputPath, 
                    tempOutputPath
                );

                if (!transcodeSuccess) {
                    throw new MediaUploadException("视频转码失败");
                }

                finalFile = tempOutputFile;
                normalizedExt = "mp4"; // 转码后统一为 mp4
                log.info("转码成功: {}", tempOutputPath);
            } else {
                finalFile = tempInputFile;
            }

            // 4. 计算最终文件的 MD5（转码后的文件）
            String md5;
            try (FileInputStream fis = new FileInputStream(finalFile)) {
                md5 = DigestUtils.md5Hex(fis);
            }

            // 5. 检查是否存在相同 MD5 的文件（去重）
            Optional<MediaFile> existingMedia = mediaFileRepository.findByMd5(md5);
            if (existingMedia.isPresent()) {
                log.info("发现重复文件，MD5: {}", md5);
                MediaFile oldMedia = existingMedia.get();
                return convertToDTO(oldMedia);
            }

            // 6. 获取媒体元数据（宽高、时长）- 仅对视频
            MediaMeta mediaMeta = null;
            if ("VIDEO".equals(fileType)) {
                if (ffprobeUtil.isAvailable()) {
                    mediaMeta = ffprobeUtil.getMediaMeta(finalFile.getAbsolutePath());
                    if (mediaMeta != null) {
                        log.info("获取媒体元数据: width={}, height={}, duration={}s", 
                            mediaMeta.getWidth(), mediaMeta.getHeight(), mediaMeta.getDurationSec());
                    } else {
                        log.warn("无法获取媒体元数据");
                    }
                } else {
                    log.warn("FFprobe 不可用，无法获取媒体元数据");
                }
            }

            // 7. 构建 MinIO 对象名（转码后统一为 mp4）
            String objectName = buildObjectName(originalFilename, normalizedExt);

            // 8. 上传到 MinIO
            String contentType = "video/mp4".equals(normalizedExt) 
                ? "video/mp4" 
                : mimeType;
            uploadFileToMinio(finalFile, objectName, contentType);
            String fileUrl = buildFileUrl(objectName);

            // 9. 生成 displayName（去掉扩展名）
            String displayName = generateDisplayName(originalFilename);

            // 10. 创建媒体文件记录
            MediaFile mediaFile = new MediaFile();
            mediaFile.setOwnerId(ownerId);
            mediaFile.setBizType("POST_MEDIA");
            mediaFile.setFileType(fileType);
            mediaFile.setUrl(fileUrl);
            mediaFile.setStoragePath(objectName);
            mediaFile.setSizeBytes(finalFile.length());
            mediaFile.setStatus(0); // 0 表示正常
            mediaFile.setMd5(md5);
            mediaFile.setOriginalName(originalFilename);
            mediaFile.setDisplayName(displayName);

            // 设置视频元数据
            if (mediaMeta != null) {
                mediaFile.setWidth(mediaMeta.getWidth());
                mediaFile.setHeight(mediaMeta.getHeight());
                mediaFile.setDurationSec(mediaMeta.getDurationSec());
            }

            MediaFile saved = mediaFileRepository.save(mediaFile);
            log.info("媒体文件保存成功: id={}, url={}", saved.getId(), saved.getUrl());

            return convertToDTO(saved);

        } catch (MediaUploadException e) {
            throw e;
        } catch (Exception e) {
            log.error("上传媒体文件失败", e);
            throw new MediaUploadException("上传媒体文件失败: " + e.getMessage(), e);
        } finally {
            // 11. 清理临时文件
            cleanupTempFile(tempInputFile);
            cleanupTempFile(tempOutputFile);
        }
    }
    
    private void cleanupTempFile(File file) {
        if (file != null && file.exists()) {
            try {
                boolean deleted = file.delete();
                if (deleted) {
                    log.debug("临时文件已删除: {}", file.getAbsolutePath());
                } else {
                    log.warn("临时文件删除失败: {}", file.getAbsolutePath());
                }
            } catch (Exception e) {
                log.warn("删除临时文件时出错: {}", file.getAbsolutePath(), e);
            }
        }
    }
    
    private String generateDisplayName(String originalFilename) {
        if (originalFilename == null) {
            return null;
        }
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return originalFilename.substring(0, lastDotIndex);
        }
        return originalFilename;
    }

    /**
     * 上传文件到 MinIO
     *
     * @param file        文件对象
     * @param objectName  对象名称（存储路径）
     * @param contentType 内容类型
     */
    private void uploadFileToMinio(File file, String objectName, String contentType) {
        try (FileInputStream fileInputStream = new FileInputStream(file)) {
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                .bucket(minioProperties.getBucket())
                .object(objectName)
                .stream(fileInputStream, file.length(), -1)
                .contentType(contentType)
                .build();
            minioClient.putObject(putObjectArgs);
            log.info("文件已上传到 MinIO: {}", objectName);
        } catch (Exception e) {
            throw new MediaUploadException("文件上传至 MinIO 失败", e);
        }
    }

    /**
     * 构建 MinIO 对象名称
     *
     * @param originalFilename 原始文件名
     * @param finalExtension   最终扩展名（转码后可能是 mp4）
     * @return 对象名称
     */
    private String buildObjectName(String originalFilename, String finalExtension) {
        String datePrefix = LocalDate.now().format(PATH_FORMAT);
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String normalizedExt = StringUtils.hasText(finalExtension) 
            ? finalExtension.toLowerCase(Locale.ROOT) 
            : "";
        return normalizedExt.isEmpty()
            ? datePrefix + "/" + uuid
            : datePrefix + "/" + uuid + "." + normalizedExt;
    }

    private String buildFileUrl(String objectName) {
        String endpoint = minioProperties.getEndpoint();
        if (endpoint.endsWith("/")) {
            endpoint = endpoint.substring(0, endpoint.length() - 1);
        }
        return endpoint + "/" + minioProperties.getBucket() + "/" + objectName;
    }

    private String resolveFileType(String mimeType) {
        if (!StringUtils.hasText(mimeType)) {
            throw new MediaUploadException("无法识别文件类型");
        }
        if (mimeType.startsWith("image/")) {
            return "IMAGE";
        }
        if (mimeType.startsWith("video/")) {
            return "VIDEO";
        }
        if (mimeType.startsWith("audio/")) {
            return "AUDIO";
        }
        throw new MediaUploadException("不支持的文件类型: " + mimeType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaDTO> getMediaByIds(Collection<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return Collections.emptyList();
        }
        List<MediaFile> mediaFiles = mediaFileRepository.findByIdIn(ids);
        return mediaFiles.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private MediaDTO convertToDTO(MediaFile mediaFile) {
        MediaDTO dto = new MediaDTO();
        dto.setId(mediaFile.getId());
        dto.setUrl(mediaFile.getUrl());
        dto.setFileType(mediaFile.getFileType());
        dto.setWidth(mediaFile.getWidth());
        dto.setHeight(mediaFile.getHeight());
        dto.setDurationSec(mediaFile.getDurationSec());
        // 优先使用 displayName，如果没有则使用 originalName
        String displayName = mediaFile.getDisplayName();
        if (displayName == null || displayName.trim().isEmpty()) {
            displayName = mediaFile.getOriginalName();
        }
        dto.setDisplayName(displayName);
        return dto;
    }
}


