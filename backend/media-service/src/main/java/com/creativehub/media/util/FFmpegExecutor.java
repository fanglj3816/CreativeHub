package com.creativehub.media.util;

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
 * FFmpeg 命令执行器
 * 用于视频转码
 */
@Component
public class FFmpegExecutor {

    private static final Logger log = LoggerFactory.getLogger(FFmpegExecutor.class);
    private static final int DEFAULT_TIMEOUT_SECONDS = 300; // 5分钟超时

    /**
     * 执行视频转码：MOV/其他格式 → MP4 (H.264 + AAC)
     *
     * @param inputFile  输入文件路径
     * @param outputFile 输出文件路径
     * @return 是否成功
     */
    public boolean transcodeToMp4(String inputFile, String outputFile) {
        return transcodeToMp4(inputFile, outputFile, DEFAULT_TIMEOUT_SECONDS);
    }

    /**
     * 执行视频转码：MOV/其他格式 → MP4 (H.264 + AAC)
     *
     * @param inputFile  输入文件路径
     * @param outputFile 输出文件路径
     * @param timeoutSeconds 超时时间（秒）
     * @return 是否成功
     */
    public boolean transcodeToMp4(String inputFile, String outputFile, int timeoutSeconds) {
        File input = new File(inputFile);
        if (!input.exists()) {
            log.error("输入文件不存在: {}", inputFile);
            return false;
        }

        File output = new File(outputFile);
        File outputDir = output.getParentFile();
        if (outputDir != null && !outputDir.exists()) {
            outputDir.mkdirs();
        }

        // 构建 FFmpeg 命令
        // -vcodec libx264: 使用 H.264 编码
        // -preset veryfast: 快速编码预设
        // -acodec aac: 使用 AAC 音频编码
        // -strict -2: 允许使用实验性编码器
        // -movflags +faststart: 将元数据移到文件开头，支持边加载边播放
        List<String> command = new ArrayList<>();
        command.add("ffmpeg");
        command.add("-i");
        command.add(inputFile);
        command.add("-vcodec");
        command.add("libx264");
        command.add("-preset");
        command.add("veryfast");
        command.add("-acodec");
        command.add("aac");
        command.add("-strict");
        command.add("-2");
        command.add("-movflags");
        command.add("+faststart");
        command.add("-y"); // 覆盖输出文件
        command.add(outputFile);

        log.info("执行转码命令: {}", String.join(" ", command));

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectErrorStream(true); // 合并标准错误和标准输出

            Process process = processBuilder.start();

            // 读取输出（用于调试）
            StringBuilder outputBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    outputBuilder.append(line).append("\n");
                }
            }

            // 等待进程完成，带超时
            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.error("转码超时: {} -> {}", inputFile, outputFile);
                return false;
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                log.error("转码失败，退出码: {}\n输出: {}", exitCode, outputBuilder.toString());
                return false;
            }

            if (!output.exists() || output.length() == 0) {
                log.error("转码输出文件不存在或为空: {}", outputFile);
                return false;
            }

            log.info("转码成功: {} -> {} ({} bytes)", inputFile, outputFile, output.length());
            return true;

        } catch (Exception e) {
            log.error("执行转码命令时出错: {} -> {}", inputFile, outputFile, e);
            return false;
        }
    }

    /**
     * 检查 FFmpeg 是否可用
     *
     * @return 是否可用
     */
    public boolean isAvailable() {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("ffmpeg", "-version");
            Process process = processBuilder.start();
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception e) {
            log.warn("FFmpeg 不可用", e);
            return false;
        }
    }
}

