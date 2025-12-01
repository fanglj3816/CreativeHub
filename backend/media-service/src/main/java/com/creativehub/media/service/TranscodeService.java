package com.creativehub.media.service;

import java.io.File;
import java.util.function.Consumer;

/**
 * 视频转码服务接口
 */
public interface TranscodeService {

    /**
     * 转码视频文件
     * @param inputFile 输入文件
     * @param outputFile 输出文件
     * @param progressCallback 进度回调，参数为进度值 (0.0 ~ 1.0)
     * @return true 如果成功，false 如果失败
     */
    boolean transcodeVideo(File inputFile, File outputFile, Consumer<Double> progressCallback);

    /**
     * 检查是否需要转码
     * @param fileExtension 文件扩展名
     * @return true 如果需要转码
     */
    boolean needsTranscode(String fileExtension);
}


