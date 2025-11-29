package com.creativehub.media.consumer;

import com.creativehub.media.config.MinioProperties;
import com.creativehub.media.config.RabbitMqConfig;
import com.creativehub.media.dto.MediaTranscodeMessage;
import com.creativehub.media.entity.MediaFile;
import com.creativehub.media.repository.MediaFileRepository;
import com.creativehub.media.service.TranscodeService;
import com.creativehub.media.util.FFprobeUtil;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 媒体转码任务消费者
 * 监听 RabbitMQ 队列，处理视频转码任务
 */
@Component
public class MediaTranscodeConsumer {

    private static final Logger log = LoggerFactory.getLogger(MediaTranscodeConsumer.class);
    private static final String TEMP_DIR = "/tmp/creativehub/transcode";
    private static final DateTimeFormatter PATH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final MediaFileRepository mediaFileRepository;
    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    private final TranscodeService transcodeService;

    public MediaTranscodeConsumer(
        MediaFileRepository mediaFileRepository,
        MinioClient minioClient,
        MinioProperties minioProperties,
        TranscodeService transcodeService
    ) {
        this.mediaFileRepository = mediaFileRepository;
        this.minioClient = minioClient;
        this.minioProperties = minioProperties;
        this.transcodeService = transcodeService;
        initTempDir();
    }

    private void initTempDir() {
        try {
            Path path = Paths.get(TEMP_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("Created transcode temp directory: {}", TEMP_DIR);
            }
        } catch (Exception e) {
            log.warn("Failed to create temp directory: {}", TEMP_DIR, e);
        }
    }

    @RabbitListener(queues = RabbitMqConfig.TRANSCODE_QUEUE)
    public void handleTranscodeTask(MediaTranscodeMessage message) {
        Long mediaId = message.getMediaId();
        log.info("Received transcode task: mediaId={}, originalObjectKey={}", mediaId, message.getOriginalObjectKey());

        MediaFile mediaFile = mediaFileRepository.findById(mediaId)
            .orElse(null);

        if (mediaFile == null) {
            log.error("Media file not found: mediaId={}, discarding message", mediaId);
            return;
        }

        // 检查状态，如果已经是完成或失败，跳过
        if (mediaFile.getStatus() != null && mediaFile.getStatus() != 1) {
            log.warn("Media file is not in processing status: mediaId={}, status={}, skipping", mediaId, mediaFile.getStatus());
            return;
        }

        File tempInputFile = null;
        File tempOutputFile = null;

        try {
            // 1. 从 MinIO 下载原始文件到临时目录
            String tempInputPath = TEMP_DIR + "/" + mediaId + "/input." + getFileExtension(message.getOriginalName());
            tempInputFile = new File(tempInputPath);
            tempInputFile.getParentFile().mkdirs();

            try (InputStream inputStream = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(message.getBucket())
                    .object(message.getOriginalObjectKey())
                    .build()
            )) {
                Files.copy(inputStream, tempInputFile.toPath());
                log.info("Downloaded original file to: {}", tempInputFile.getAbsolutePath());
            }

            // 2. 执行转码
            String tempOutputPath = TEMP_DIR + "/" + mediaId + "/output.mp4";
            tempOutputFile = new File(tempOutputPath);

            log.info("Starting transcoding for mediaId={}, inputFile={}, outputFile={}", 
                mediaId, tempInputFile.getAbsolutePath(), tempOutputFile.getAbsolutePath());
            
            // 初始化进度为0
            updateProgress(mediaId, BigDecimal.ZERO);
            
            boolean success = transcodeService.transcodeVideo(
                tempInputFile,
                tempOutputFile,
                progress -> {
                    // 更新转码进度
                    BigDecimal progressDecimal = BigDecimal.valueOf(progress);
                    log.debug("Transcode progress callback: mediaId={}, progress={}", 
                        mediaId, String.format("%.4f", progressDecimal));
                    updateProgress(mediaId, progressDecimal);
                }
            );
            
            log.info("Transcoding finished for mediaId={}, success={}", mediaId, success);

            if (!success) {
                throw new RuntimeException("FFmpeg transcoding failed");
            }

            // 3. 上传转码后的文件到 MinIO
            String transcodedObjectKey = buildTranscodedObjectName(mediaId);
            try (FileInputStream fileInputStream = new FileInputStream(tempOutputFile)) {
                minioClient.putObject(
                    PutObjectArgs.builder()
                        .bucket(minioProperties.getBucket())
                        .object(transcodedObjectKey)
                        .stream(fileInputStream, tempOutputFile.length(), -1)
                        .contentType("video/mp4")
                        .build()
                );
                log.info("Uploaded transcoded file to MinIO: {}", transcodedObjectKey);
            }

            // 4. 提取转码后视频的元数据
            FFprobeUtil.MediaMeta outputMeta = FFprobeUtil.getMediaMetadata(tempOutputFile);

            // 5. 更新数据库记录
            mediaFile = mediaFileRepository.findById(mediaId).orElse(null);
            if (mediaFile == null) {
                log.error("Media file not found after transcoding: mediaId={}", mediaId);
                return;
            }

            String transcodedUrl = buildFileUrl(transcodedObjectKey);
            BigDecimal finalProgress = mediaFile.getProgress();
            mediaFile.setUrl(transcodedUrl);
            mediaFile.setStoragePath(transcodedObjectKey);
            mediaFile.setFileType("VIDEO");
            mediaFile.setSizeBytes(tempOutputFile.length());
            mediaFile.setStatus(0); // 完成
            mediaFile.setProgress(BigDecimal.ONE);
            mediaFile.setErrorMsg(null);

            if (outputMeta != null) {
                mediaFile.setWidth(outputMeta.getWidth());
                mediaFile.setHeight(outputMeta.getHeight());
                mediaFile.setDurationSec(outputMeta.getDurationSec());
            }

            MediaFile saved = mediaFileRepository.saveAndFlush(mediaFile);
            log.info("Transcoding completed successfully: mediaId={}, finalProgressBeforeCompletion={}, savedProgress={}", 
                mediaId,
                finalProgress != null ? String.format("%.4f", finalProgress) : "null",
                saved.getProgress() != null ? String.format("%.4f", saved.getProgress()) : "null");

        } catch (Exception e) {
            log.error("Transcoding failed: mediaId={}", mediaId, e);
            handleTranscodeError(mediaId, e);
        } finally {
            // 清理临时文件
            cleanupTempFiles(tempInputFile, tempOutputFile, mediaId);
        }
    }

    @Transactional
    private void updateProgress(Long mediaId, BigDecimal progress) {
        try {
            MediaFile mediaFile = mediaFileRepository.findById(mediaId).orElse(null);
            if (mediaFile != null && mediaFile.getStatus() != null && mediaFile.getStatus() == 1) {
                BigDecimal oldProgress = mediaFile.getProgress();
                mediaFile.setProgress(progress);
                MediaFile saved = mediaFileRepository.saveAndFlush(mediaFile); // 使用 saveAndFlush 立即提交
                log.info("Progress updated in database: mediaId={}, oldProgress={}, newProgress={}, savedProgress={}", 
                    mediaId, 
                    oldProgress != null ? String.format("%.4f", oldProgress) : "null",
                    String.format("%.4f", progress),
                    saved.getProgress() != null ? String.format("%.4f", saved.getProgress()) : "null");
            } else {
                log.warn("Cannot update progress: mediaId={}, mediaFile={}, status={}", 
                    mediaId, 
                    mediaFile != null ? "exists" : "null",
                    mediaFile != null ? mediaFile.getStatus() : "N/A");
            }
        } catch (Exception e) {
            log.error("Failed to update progress: mediaId={}, progress={}", mediaId, progress, e);
        }
    }

    private void handleTranscodeError(Long mediaId, Exception e) {
        try {
            MediaFile mediaFile = mediaFileRepository.findById(mediaId).orElse(null);
            if (mediaFile != null) {
                mediaFile.setStatus(2); // 失败
                String errorMsg = e.getMessage();
                if (errorMsg != null && errorMsg.length() > 500) {
                    errorMsg = errorMsg.substring(0, 500);
                }
                mediaFile.setErrorMsg(errorMsg);
                mediaFileRepository.save(mediaFile);
            }
        } catch (Exception ex) {
            log.error("Failed to update error status: mediaId={}", mediaId, ex);
        }
    }

    private void cleanupTempFiles(File inputFile, File outputFile, Long mediaId) {
        try {
            if (inputFile != null && inputFile.exists()) {
                Files.deleteIfExists(inputFile.toPath());
            }
            if (outputFile != null && outputFile.exists()) {
                Files.deleteIfExists(outputFile.toPath());
            }
            // 删除整个临时目录
            Path tempDir = Paths.get(TEMP_DIR, String.valueOf(mediaId));
            if (Files.exists(tempDir)) {
                Files.walk(tempDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (Exception e) {
                            log.warn("Failed to delete temp file: {}", path, e);
                        }
                    });
            }
        } catch (Exception e) {
            log.warn("Failed to cleanup temp files for mediaId={}", mediaId, e);
        }
    }

    private String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "";
    }

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
}

