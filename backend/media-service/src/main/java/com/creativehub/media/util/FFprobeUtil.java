package com.creativehub.media.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * FFprobe 工具类
 * 用于获取媒体文件元数据（宽高、时长等）
 */
@Component
public class FFprobeUtil {

    private static final Logger log = LoggerFactory.getLogger(FFprobeUtil.class);
    private static final int DEFAULT_TIMEOUT_SECONDS = 30;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 获取媒体文件元数据
     *
     * @param filePath 文件路径
     * @return 媒体元数据，失败返回 null
     */
    public MediaMeta getMediaMeta(String filePath) {
        return getMediaMeta(filePath, DEFAULT_TIMEOUT_SECONDS);
    }

    /**
     * 获取媒体文件元数据
     *
     * @param filePath      文件路径
     * @param timeoutSeconds 超时时间（秒）
     * @return 媒体元数据，失败返回 null
     */
    public MediaMeta getMediaMeta(String filePath, int timeoutSeconds) {
        File file = new File(filePath);
        if (!file.exists()) {
            log.error("文件不存在: {}", filePath);
            return null;
        }

        // 构建 FFprobe 命令
        // -v quiet: 静默模式
        // -print_format json: 输出 JSON 格式
        // -show_format: 显示格式信息
        // -show_streams: 显示流信息
        List<String> command = new ArrayList<>();
        command.add("ffprobe");
        command.add("-v");
        command.add("quiet");
        command.add("-print_format");
        command.add("json");
        command.add("-show_format");
        command.add("-show_streams");
        command.add(filePath);

        log.debug("执行 FFprobe 命令: {}", String.join(" ", command));

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            // 读取 JSON 输出
            StringBuilder jsonOutput = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    jsonOutput.append(line).append("\n");
                }
            }

            // 等待进程完成
            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.error("FFprobe 超时: {}", filePath);
                return null;
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                log.error("FFprobe 执行失败，退出码: {}", exitCode);
                return null;
            }

            // 解析 JSON
            String json = jsonOutput.toString();
            if (json.trim().isEmpty()) {
                log.error("FFprobe 输出为空: {}", filePath);
                return null;
            }

            return parseMediaMeta(json);

        } catch (Exception e) {
            log.error("执行 FFprobe 命令时出错: {}", filePath, e);
            return null;
        }
    }

    /**
     * 解析 FFprobe JSON 输出
     *
     * @param json JSON 字符串
     * @return 媒体元数据
     */
    private MediaMeta parseMediaMeta(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);

            Integer width = null;
            Integer height = null;
            Double duration = null;

            // 从 streams 中查找视频流，获取宽高
            JsonNode streams = root.get("streams");
            if (streams != null && streams.isArray()) {
                for (JsonNode stream : streams) {
                    String codecType = stream.has("codec_type") 
                        ? stream.get("codec_type").asText() 
                        : null;
                    
                    if ("video".equals(codecType)) {
                        if (width == null && stream.has("width")) {
                            width = stream.get("width").asInt();
                        }
                        if (height == null && stream.has("height")) {
                            height = stream.get("height").asInt();
                        }
                        // 找到视频流后可以继续查找时长，但通常从 format 获取更准确
                    }
                }
            }

            // 从 format 中获取时长
            JsonNode format = root.get("format");
            if (format != null && format.has("duration")) {
                String durationStr = format.get("duration").asText();
                if (durationStr != null && !durationStr.isEmpty()) {
                    try {
                        duration = Double.parseDouble(durationStr);
                    } catch (NumberFormatException e) {
                        log.warn("无法解析时长: {}", durationStr);
                    }
                }
            }

            // 如果 streams 中没有找到宽高，尝试从 format 的 tags 中获取
            if ((width == null || height == null) && format != null) {
                JsonNode tags = format.get("tags");
                if (tags != null) {
                    if (width == null && tags.has("width")) {
                        try {
                            width = Integer.parseInt(tags.get("width").asText());
                        } catch (NumberFormatException ignored) {
                        }
                    }
                    if (height == null && tags.has("height")) {
                        try {
                            height = Integer.parseInt(tags.get("height").asText());
                        } catch (NumberFormatException ignored) {
                        }
                    }
                }
            }

            Integer durationSec = null;
            if (duration != null) {
                durationSec = (int) Math.round(duration);
            }

            MediaMeta meta = new MediaMeta(width, height, durationSec);
            log.debug("解析媒体元数据: width={}, height={}, duration={}s", width, height, durationSec);
            return meta;

        } catch (Exception e) {
            log.error("解析 FFprobe JSON 输出失败", e);
            return null;
        }
    }

    /**
     * 检查 FFprobe 是否可用
     *
     * @return 是否可用
     */
    public boolean isAvailable() {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("ffprobe", "-version");
            Process process = processBuilder.start();
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception e) {
            log.warn("FFprobe 不可用", e);
            return false;
        }
    }
}

