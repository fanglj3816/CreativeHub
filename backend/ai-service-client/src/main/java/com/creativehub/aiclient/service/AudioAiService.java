package com.creativehub.aiclient.service;

import com.creativehub.aiclient.client.AudioAiClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * AI 音频处理业务服务
 * 对外提供音频分离相关的业务方法
 */
@Service
public class AudioAiService {

    private final AudioAiClient audioAiClient;

    public AudioAiService(AudioAiClient audioAiClient) {
        this.audioAiClient = audioAiClient;
    }

    /**
     * 人声/伴奏分离
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    public String vocalSeparate(MultipartFile file) {
        return audioAiClient.separateVocal(file);
    }

    /**
     * 4 轨分离（Demucs）
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    public String demucs4Separate(MultipartFile file) {
        return audioAiClient.separateDemucs4(file);
    }

    /**
     * 6 轨分离（Demucs）
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    public String demucs6Separate(MultipartFile file) {
        return audioAiClient.separateDemucs6(file);
    }
}




