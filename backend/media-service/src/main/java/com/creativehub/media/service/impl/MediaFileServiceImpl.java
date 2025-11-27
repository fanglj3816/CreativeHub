package com.creativehub.media.service.impl;

import com.creativehub.media.config.MinioProperties;
import com.creativehub.media.dto.UploadResponse;
import com.creativehub.media.entity.MediaFile;
import com.creativehub.media.exception.MediaUploadException;
import com.creativehub.media.repository.MediaFileRepository;
import com.creativehub.media.service.MediaFileService;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaFileServiceImpl implements MediaFileService {

    private static final DateTimeFormatter PATH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    private final MediaFileRepository mediaFileRepository;

    public MediaFileServiceImpl(MinioClient minioClient,
                                MinioProperties minioProperties,
                                MediaFileRepository mediaFileRepository) {
        this.minioClient = minioClient;
        this.minioProperties = minioProperties;
        this.mediaFileRepository = mediaFileRepository;
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

        String mimeType = file.getContentType();
        String fileType = resolveFileType(mimeType);
        String objectName = buildObjectName(file.getOriginalFilename());

        uploadToMinio(file, objectName, mimeType);
        String fileUrl = buildFileUrl(objectName);

        MediaFile mediaFile = new MediaFile();
        mediaFile.setOwnerId(ownerId);
        mediaFile.setBizType("POST_IMAGE");
        mediaFile.setFileType(fileType);
        mediaFile.setUrl(fileUrl);
        mediaFile.setStoragePath(objectName);
        mediaFile.setSizeBytes(file.getSize());
        mediaFile.setStatus(1);

        MediaFile saved = mediaFileRepository.save(mediaFile);
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
}


