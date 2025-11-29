package com.creativehub.media.service.impl;

import com.creativehub.common.core.dto.MediaDTO;
import com.creativehub.media.config.MinioProperties;
import com.creativehub.media.dto.MediaTranscodeMessage;
import com.creativehub.media.dto.UploadResponse;
import com.creativehub.media.entity.MediaFile;
import com.creativehub.media.exception.MediaUploadException;
import com.creativehub.media.repository.MediaFileRepository;
import com.creativehub.media.service.MediaFileService;
import com.creativehub.media.service.MediaTranscodeProducer;
import com.creativehub.media.service.TranscodeService;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaFileServiceImpl implements MediaFileService {

    private static final DateTimeFormatter PATH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    private final MediaFileRepository mediaFileRepository;
    private final MediaTranscodeProducer transcodeProducer;
    private final TranscodeService transcodeService;

    public MediaFileServiceImpl(MinioClient minioClient,
                                MinioProperties minioProperties,
                                MediaFileRepository mediaFileRepository,
                                MediaTranscodeProducer transcodeProducer,
                                TranscodeService transcodeService) {
        this.minioClient = minioClient;
        this.minioProperties = minioProperties;
        this.mediaFileRepository = mediaFileRepository;
        this.transcodeProducer = transcodeProducer;
        this.transcodeService = transcodeService;
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

        // 1. 计算文件内容的 MD5 值
        String fileMd5;
        try (InputStream inputStream = file.getInputStream()) {
            fileMd5 = DigestUtils.md5Hex(inputStream);
        } catch (Exception e) {
            throw new MediaUploadException("计算文件 MD5 失败", e);
        }

        // 2. 将文件 MD5 和用户ID一起计算最终 MD5（避免不同用户上传相同文件时冲突）
        String combinedData = fileMd5 + ":" + ownerId;
        String md5 = DigestUtils.md5Hex(combinedData.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        // 3. 检查该用户是否已上传过相同文件（去重）
        Optional<MediaFile> existingMedia = mediaFileRepository.findByMd5AndOwnerId(md5, ownerId);
        if (existingMedia.isPresent()) {
            // 找到该用户上传的重复文件，直接返回旧记录，不上传 MinIO，不创建新记录
            MediaFile oldMedia = existingMedia.get();
            return new UploadResponse(oldMedia.getId(), oldMedia.getUrl());
        }

        // 3. 没有重复文件，继续执行正常上传流程
        String mimeType = file.getContentType();
        String fileType = resolveFileType(mimeType);
        String originalFilename = file.getOriginalFilename();
        String fileExtension = StringUtils.getFilenameExtension(originalFilename);
        String normalizedExt = StringUtils.hasText(fileExtension) ? fileExtension.toLowerCase(Locale.ROOT) : "";

        // 判断是否为视频且需要转码
        boolean isVideo = "VIDEO".equals(fileType);
        boolean needsTranscode = isVideo && transcodeService.needsTranscode(normalizedExt);
        // 兼容视频：mp4格式，无需转码
        boolean isCompatibleVideo = isVideo && !needsTranscode && "mp4".equals(normalizedExt);

        // 构建原始文件存储路径
        String originalObjectName = buildOriginalObjectName(originalFilename);

        // 4. 上传原始文件到 MinIO（original 目录）
        uploadToMinio(file, originalObjectName, mimeType);

        // 5. 创建媒体文件记录
        MediaFile mediaFile = new MediaFile();
        mediaFile.setOwnerId(ownerId);
        mediaFile.setBizType(isVideo ? "POST_VIDEO" : "POST_IMAGE");
        mediaFile.setFileType(fileType);
        mediaFile.setStoragePath(originalObjectName);
        mediaFile.setSizeBytes(file.getSize());
        mediaFile.setMd5(md5);
        mediaFile.setOriginalName(originalFilename);

        // 设置 displayName（去掉扩展名）
        String baseName = StringUtils.stripFilenameExtension(originalFilename);
        mediaFile.setDisplayName(baseName);

        // 根据文件类型设置初始状态
        if (needsTranscode) {
            // 需要转码：状态=1（处理中），progress=0，url暂时为空
            mediaFile.setStatus(1);
            mediaFile.setProgress(java.math.BigDecimal.ZERO);
            mediaFile.setUrl(null);
        } else if (isCompatibleVideo) {
            // 兼容视频：直接设置URL，但需要提取元数据（可以异步或同步，这里选择同步快速完成）
            String fileUrl = buildFileUrl(originalObjectName);
            mediaFile.setUrl(fileUrl);
            mediaFile.setStatus(0); // 完成
            mediaFile.setProgress(java.math.BigDecimal.ONE);
            // 注意：兼容视频的元数据提取可以后续优化为异步
        } else {
            // 图片/音频：直接完成
            String fileUrl = buildFileUrl(originalObjectName);
            mediaFile.setUrl(fileUrl);
            mediaFile.setStatus(0);
            mediaFile.setProgress(java.math.BigDecimal.ONE);
        }

        MediaFile saved = mediaFileRepository.save(mediaFile);

        // 6. 如果需要转码，发送转码任务到MQ
        if (needsTranscode) {
            MediaTranscodeMessage message = new MediaTranscodeMessage(
                saved.getId(),
                minioProperties.getBucket(),
                originalObjectName,
                originalFilename,
                ownerId
            );
            try {
                transcodeProducer.sendTranscodeTask(message);
            } catch (Exception e) {
                // 发送MQ失败，更新状态为失败
                saved.setStatus(2);
                saved.setErrorMsg("发送转码任务失败: " + e.getMessage());
                mediaFileRepository.save(saved);
                throw new MediaUploadException("发送转码任务失败", e);
            }
        }

        return new UploadResponse(saved.getId(), saved.getUrl());
    }

    private void uploadToMinio(MultipartFile file, String objectName, String mimeType) {
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                .bucket(minioProperties.getBucket())
                .object(objectName)
                .stream(inputStream, file.getSize(), -1)
                .contentType(mimeType)
                .build();
            minioClient.putObject(putObjectArgs);
        } catch (Exception e) {
            throw new MediaUploadException("文件上传至 MinIO 失败", e);
        }
    }

    private String buildObjectName(String originalFilename) {
        String datePrefix = LocalDate.now().format(PATH_FORMAT);
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String ext = StringUtils.getFilenameExtension(originalFilename);
        String normalizedExt = StringUtils.hasText(ext) ? ext.toLowerCase(Locale.ROOT) : "";
        return normalizedExt.isEmpty()
            ? datePrefix + "/" + uuid
            : datePrefix + "/" + uuid + "." + normalizedExt;
    }

    /**
     * 构建原始文件存储路径（original目录）
     */
    private String buildOriginalObjectName(String originalFilename) {
        String datePrefix = LocalDate.now().format(PATH_FORMAT);
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String ext = StringUtils.getFilenameExtension(originalFilename);
        String normalizedExt = StringUtils.hasText(ext) ? ext.toLowerCase(Locale.ROOT) : "";
        return normalizedExt.isEmpty()
            ? "original/" + datePrefix + "/" + uuid
            : "original/" + datePrefix + "/" + uuid + "." + normalizedExt;
    }

    /**
     * 构建转码后的视频存储路径（video目录）
     */
    private String buildTranscodedObjectName(Long mediaId) {
        String datePrefix = LocalDate.now().format(PATH_FORMAT);
        return "video/" + datePrefix + "/" + mediaId + ".mp4";
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

    @Override
    @Transactional
    public void deleteMediaByIds(Collection<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return;
        }
        List<MediaFile> filesToDelete = mediaFileRepository.findByIdIn(ids);
        for (MediaFile file : filesToDelete) {
            String objectName = file.getStoragePath();
            if (StringUtils.hasText(objectName)) {
                try {
                    minioClient.removeObject(
                        RemoveObjectArgs.builder()
                            .bucket(minioProperties.getBucket())
                            .object(objectName)
                            .build()
                    );
                } catch (Exception e) {
                    // 记录错误但继续删除数据库记录
                    org.slf4j.LoggerFactory.getLogger(MediaFileServiceImpl.class)
                        .warn("Failed to delete MinIO object: {}", objectName, e);
                }
            }
        }
        mediaFileRepository.deleteAll(filesToDelete);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaDTO getMediaStatus(Long mediaId) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaId)
            .orElseThrow(() -> new MediaUploadException("媒体文件不存在: " + mediaId));
        return convertToDTO(mediaFile);
    }

    private MediaDTO convertToDTO(MediaFile mediaFile) {
        MediaDTO dto = new MediaDTO();
        dto.setId(mediaFile.getId());
        dto.setUrl(mediaFile.getUrl());
        dto.setFileType(mediaFile.getFileType());
        dto.setWidth(mediaFile.getWidth());
        dto.setHeight(mediaFile.getHeight());
        dto.setDurationSec(mediaFile.getDurationSec());
        dto.setStatus(mediaFile.getStatus());
        dto.setProgress(mediaFile.getProgress());
        dto.setErrorMsg(mediaFile.getErrorMsg());
        // 优先使用 displayName，如果没有则使用 originalName
        String displayName = mediaFile.getDisplayName();
        if (displayName == null || displayName.trim().isEmpty()) {
            displayName = mediaFile.getOriginalName();
        }
        dto.setDisplayName(displayName);
        return dto;
    }
}


