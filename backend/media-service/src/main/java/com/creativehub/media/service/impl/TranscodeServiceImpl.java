package com.creativehub.media.service.impl;

import com.creativehub.media.service.TranscodeService;
import com.creativehub.media.util.FFmpegExecutor;
import com.creativehub.media.util.FFprobeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.Locale;
import java.util.Set;
import java.util.function.Consumer;

/**
 * 视频转码服务实现
 */
@Service
public class TranscodeServiceImpl implements TranscodeService {

    private static final Logger log = LoggerFactory.getLogger(TranscodeServiceImpl.class);

    // 需要转码的视频格式
    private static final Set<String> TRANSCODE_VIDEO_FORMATS = Set.of(
        "mov", "mkv", "avi", "hevc", "flv", "wmv", "m4v", "3gp"
    );

    // 兼容的视频格式（无需转码）
    private static final Set<String> COMPATIBLE_VIDEO_FORMATS = Set.of("mp4");

    @Override
    public boolean transcodeVideo(File inputFile, File outputFile, Consumer<Double> progressCallback) {
        if (inputFile == null || !inputFile.exists()) {
            log.error("Input file does not exist: {}", inputFile);
            return false;
        }

        // 先获取视频总时长
        FFprobeUtil.MediaMeta inputMeta = FFprobeUtil.getMediaMetadata(inputFile);
        if (inputMeta == null || inputMeta.getDurationSec() == null || inputMeta.getDurationSec() <= 0) {
            log.warn("Failed to get video duration, progress tracking may be inaccurate");
        }

        final long totalDurationMs = inputMeta != null && inputMeta.getDurationSec() != null
            ? inputMeta.getDurationSec() * 1000L
            : 0;

        // 创建临时进度文件
        File progressFile = new File(outputFile.getParent(), "progress_" + System.currentTimeMillis() + ".txt");
        
        // 构建 FFmpeg 命令
        String[] command = {
            "ffmpeg",
            "-i", inputFile.getAbsolutePath(),
            "-vcodec", "libx264",
            "-preset", "veryfast",
            "-acodec", "aac",
            "-strict", "-2",
            "-movflags", "+faststart",
            "-progress", progressFile.getAbsolutePath(), // 输出进度到文件
            "-y", // 覆盖输出文件
            outputFile.getAbsolutePath()
        };

        log.info("Starting video transcoding: {} -> {}, progressFile={}", 
            inputFile.getName(), outputFile.getName(), progressFile.getAbsolutePath());

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();
            final long[] lastProgressUpdate = {System.currentTimeMillis()};
            final long PROGRESS_UPDATE_INTERVAL_MS = 500; // 每0.5秒更新一次进度

            // 启动一个线程来读取进度文件
            Thread progressReaderThread = new Thread(() -> {
                try {
                    while (process.isAlive()) {
                        if (progressFile.exists()) {
                            try (BufferedReader reader = new BufferedReader(new java.io.FileReader(progressFile))) {
                                String line;
                                String lastTimeStr = null;
                                while ((line = reader.readLine()) != null) {
                                    if (line.startsWith("out_time_ms=")) {
                                        lastTimeStr = line.substring("out_time_ms=".length()).trim();
                                    }
                                }
                                
                                if (lastTimeStr != null && !lastTimeStr.isEmpty() && !lastTimeStr.equals("N/A") && totalDurationMs > 0) {
                                    try {
                                        long currentTimeMs = Long.parseLong(lastTimeStr) / 1000; // 微秒转毫秒
                                        double progress = Math.min(1.0, (double) currentTimeMs / totalDurationMs);

                                        // 限制更新频率，避免数据库压力过大
                                        long now = System.currentTimeMillis();
                                        if (now - lastProgressUpdate[0] >= PROGRESS_UPDATE_INTERVAL_MS) {
                                            log.info("Transcode progress update: {}% (currentTime={}ms, totalDuration={}ms)", 
                                                String.format("%.2f", progress * 100), currentTimeMs, totalDurationMs);
                                            if (progressCallback != null) {
                                                progressCallback.accept(progress);
                                            }
                                            lastProgressUpdate[0] = now;
                                        }
                                    } catch (NumberFormatException e) {
                                        log.debug("Failed to parse time string: {}", lastTimeStr);
                                    }
                                }
                            } catch (Exception e) {
                                log.debug("Failed to read progress file: {}", e.getMessage());
                            }
                        }
                        Thread.sleep(200); // 每200ms检查一次进度文件
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            progressReaderThread.setDaemon(true);
            progressReaderThread.start();

            // 读取 FFmpeg 的标准输出（用于错误信息）
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // 可以在这里记录 FFmpeg 的输出日志
                    log.debug("FFmpeg output: {}", line);
                }
            }

            int exitCode = process.waitFor();
            
            // 等待进度读取线程完成
            progressReaderThread.join(1000);
            
            // 转码完成，确保进度为100%
            if (progressCallback != null) {
                progressCallback.accept(1.0);
            }
            
            if (exitCode != 0) {
                log.error("FFmpeg transcoding failed with exit code: {}", exitCode);
                return false;
            }

            log.info("Video transcoding completed successfully: {}", outputFile.getName());
            return true;

        } catch (Exception e) {
            log.error("Error during video transcoding: {}", e.getMessage(), e);
            return false;
        } finally {
            // 清理进度文件
            if (progressFile.exists()) {
                try {
                    progressFile.delete();
                } catch (Exception e) {
                    log.debug("Failed to delete progress file: {}", e.getMessage());
                }
            }
        }
    }

    @Override
    public boolean needsTranscode(String fileExtension) {
        if (!StringUtils.hasText(fileExtension)) {
            return false;
        }
        String normalizedExt = fileExtension.toLowerCase(Locale.ROOT);
        return TRANSCODE_VIDEO_FORMATS.contains(normalizedExt);
    }

    /**
     * 检查是否为兼容格式（无需转码）
     */
    public boolean isCompatibleFormat(String fileExtension) {
        if (!StringUtils.hasText(fileExtension)) {
            return false;
        }
        String normalizedExt = fileExtension.toLowerCase(Locale.ROOT);
        return COMPATIBLE_VIDEO_FORMATS.contains(normalizedExt);
    }
}

