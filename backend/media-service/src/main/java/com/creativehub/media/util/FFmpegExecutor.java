package com.creativehub.media.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * FFmpeg 命令执行工具类
 * 支持进度回调
 */
public class FFmpegExecutor {

    private static final Logger log = LoggerFactory.getLogger(FFmpegExecutor.class);
    private static final long DEFAULT_TIMEOUT_SECONDS = 1800; // 30分钟

    /**
     * 执行 FFmpeg 转码命令，带进度回调
     * @param command FFmpeg 命令数组
     * @param progressCallback 进度回调函数，参数为当前进度 (0.0 ~ 1.0)
     * @return true 如果成功，false 如果失败
     */
    public static boolean executeTranscode(String[] command, Consumer<Double> progressCallback) {
        return executeTranscode(command, DEFAULT_TIMEOUT_SECONDS, progressCallback);
    }

    /**
     * 执行 FFmpeg 转码命令，带进度回调和超时
     */
    public static boolean executeTranscode(String[] command, long timeoutSeconds, Consumer<Double> progressCallback) {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();
            StringBuilder output = new StringBuilder();
            
            // 读取标准输出和错误输出
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    
                    // 解析进度信息
                    if (progressCallback != null && line.startsWith("out_time_ms=")) {
                        try {
                            // 提取时间戳（微秒）
                            String timeStr = line.substring("out_time_ms=".length()).trim();
                            if (!timeStr.isEmpty() && !timeStr.equals("N/A")) {
                                long timeMs = Long.parseLong(timeStr) / 1000; // 转换为毫秒
                                // 注意：这里需要总时长才能计算进度，总时长需要从外部传入
                                // 暂时只记录，实际进度在 Consumer 中通过 FFprobe 获取总时长后计算
                            }
                        } catch (Exception e) {
                            // 忽略解析错误
                        }
                    }
                }
            }

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);

            if (!finished) {
                log.error("FFmpeg command timed out after {} seconds: {}", timeoutSeconds, Arrays.toString(command));
                process.destroyForcibly();
                return false;
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                log.error("FFmpeg command failed with exit code {}: {}", exitCode, Arrays.toString(command));
                log.error("FFmpeg output:\n{}", output.toString());
                return false;
            }

            log.info("FFmpeg command executed successfully: {}", Arrays.toString(command));
            return true;

        } catch (Exception e) {
            log.error("Error executing FFmpeg command {}: {}", Arrays.toString(command), e.getMessage(), e);
            return false;
        }
    }

    /**
     * 检查 FFmpeg 是否可用
     */
    public static boolean isAvailable() {
        try {
            Process process = new ProcessBuilder("ffmpeg", "-version").start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            log.warn("FFmpeg is not available in PATH: {}", e.getMessage());
            return false;
        }
    }
}














