package com.creativehub.media.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

/**
 * FFprobe 工具类，用于提取媒体元数据
 */
public class FFprobeUtil {

    private static final Logger log = LoggerFactory.getLogger(FFprobeUtil.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final long DEFAULT_TIMEOUT_SECONDS = 60;

    /**
     * 媒体元数据 DTO
     */
    public static class MediaMeta {
        private Integer width;
        private Integer height;
        private Integer durationSec;

        public Integer getWidth() {
            return width;
        }

        public void setWidth(Integer width) {
            this.width = width;
        }

        public Integer getHeight() {
            return height;
        }

        public void setHeight(Integer height) {
            this.height = height;
        }

        public Integer getDurationSec() {
            return durationSec;
        }

        public void setDurationSec(Integer durationSec) {
            this.durationSec = durationSec;
        }
    }

    /**
     * 提取媒体元数据
     */
    public static MediaMeta getMediaMetadata(File mediaFile) {
        if (mediaFile == null || !mediaFile.exists()) {
            log.warn("Media file does not exist: {}", mediaFile != null ? mediaFile.getAbsolutePath() : "null");
            return null;
        }

        String[] command = {
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            mediaFile.getAbsolutePath()
        };

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            boolean finished = process.waitFor(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                log.error("FFprobe command timed out for file: {}", mediaFile.getName());
                process.destroyForcibly();
                return null;
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                log.error("FFprobe command failed with exit code {} for file: {}", exitCode, mediaFile.getName());
                return null;
            }

            return parseFFprobeOutput(output.toString());

        } catch (Exception e) {
            log.error("Error executing FFprobe command for file {}: {}", mediaFile.getName(), e.getMessage(), e);
            return null;
        }
    }

    private static MediaMeta parseFFprobeOutput(String jsonOutput) {
        try {
            JsonNode root = objectMapper.readTree(jsonOutput);
            MediaMeta meta = new MediaMeta();

            // 解析 format 中的 duration
            JsonNode format = root.get("format");
            if (format != null && format.has("duration")) {
                try {
                    double duration = format.get("duration").asDouble();
                    meta.setDurationSec((int) Math.round(duration));
                } catch (Exception e) {
                    log.warn("Failed to parse duration: {}", e.getMessage());
                }
            }

            // 解析 streams 中的 width 和 height
            JsonNode streams = root.get("streams");
            if (streams != null && streams.isArray()) {
                for (JsonNode stream : streams) {
                    if (stream.has("codec_type") && "video".equals(stream.get("codec_type").asText())) {
                        if (stream.has("width")) {
                            meta.setWidth(stream.get("width").asInt());
                        }
                        if (stream.has("height")) {
                            meta.setHeight(stream.get("height").asInt());
                        }
                        break;
                    }
                }
            }

            return meta;
        } catch (Exception e) {
            log.error("Failed to parse FFprobe JSON output: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 检查 FFprobe 是否可用
     */
    public static boolean isAvailable() {
        try {
            Process process = new ProcessBuilder("ffprobe", "-version").start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            log.warn("FFprobe is not available in PATH: {}", e.getMessage());
            return false;
        }
    }
}

