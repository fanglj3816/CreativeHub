package com.creativehub.aiclient.example;

import com.creativehub.aiclient.service.AudioAiService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * AudioAiService 使用示例
 *
 * 此示例展示了如何在业务模块中注入并使用 AudioAiService
 *
 * 使用步骤：
 * 1. 在业务模块的 application.yml 中配置：
 *    ai:
 *      service:
 *        base-url: http://localhost:8001
 *
 * 2. 在业务 Service 中注入 AudioAiService
 *
 * 3. 调用相应的方法处理音频文件
 */
@Service
public class AudioAiServiceUsageExample {

    private final AudioAiService audioAiService;

    /**
     * 构造函数注入 AudioAiService
     */
    public AudioAiServiceUsageExample(AudioAiService audioAiService) {
        this.audioAiService = audioAiService;
    }

    /**
     * 示例：调用人声分离服务
     *
     * @param audioFile 音频文件
     * @return Python 服务返回的 JSON 字符串
     *         格式示例：{"vocal": "path/to/vocal.wav", "instrumental": "path/to/instrumental.wav"}
     */
    public String exampleVocalSeparate(MultipartFile audioFile) {
        // 调用人声分离接口
        // Python 接口：POST /separate/vocal
        String result = audioAiService.vocalSeparate(audioFile);

        // result 是 JSON 字符串，可以进一步解析
        // 例如使用 Jackson: ObjectMapper.readValue(result, Map.class)

        return result;
    }

    /**
     * 示例：调用 4 轨分离服务（Demucs）
     *
     * @param audioFile 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    public String exampleDemucs4Separate(MultipartFile audioFile) {
        // 调用 4 轨分离接口
        // Python 接口：POST /separate/demucs4
        return audioAiService.demucs4Separate(audioFile);
    }

    /**
     * 示例：调用 6 轨分离服务（Demucs）
     *
     * @param audioFile 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    public String exampleDemucs6Separate(MultipartFile audioFile) {
        // 调用 6 轨分离接口
        // Python 接口：POST /separate/demucs6
        return audioAiService.demucs6Separate(audioFile);
    }

    /**
     * 示例：带异常处理的调用
     */
    public String exampleWithExceptionHandling(MultipartFile audioFile) {
        try {
            String result = audioAiService.vocalSeparate(audioFile);
            // 处理成功结果
            return result;
        } catch (com.creativehub.aiclient.client.exception.AudioServiceCallException e) {
            // 处理调用失败
            // 可以记录日志、返回错误响应等
            throw new RuntimeException("AI 服务调用失败: " + e.getMessage(), e);
        }
    }
}




