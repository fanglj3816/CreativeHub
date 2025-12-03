package com.creativehub.aiclient.client;

import com.creativehub.aiclient.client.config.AudioAiServiceProperties;
import com.creativehub.aiclient.client.exception.AudioServiceCallException;
import com.creativehub.aiclient.client.util.MultipartInputStreamFileResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

/**
 * AI 音频服务 HTTP 客户端
 * 负责调用运行在 http://localhost:8001 的 Python FastAPI 服务
 */
@Service
public class AudioAiClient {

    private final RestTemplate restTemplate;
    private final AudioAiServiceProperties properties;

    public AudioAiClient(RestTemplate restTemplate, AudioAiServiceProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    /**
     * 调用人声/伴奏分离接口
     * Python 接口：POST /separate/vocal
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     * @throws AudioServiceCallException 当调用失败时抛出
     */
    public String separateVocal(MultipartFile file) {
        String url = properties.getBaseUrl() + "/separate/vocal";
        return callService(url, file);
    }

    /**
     * 调用 4 轨分离接口（Demucs）
     * Python 接口：POST /separate/demucs4
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     * @throws AudioServiceCallException 当调用失败时抛出
     */
    public String separateDemucs4(MultipartFile file) {
        String url = properties.getBaseUrl() + "/separate/demucs4";
        return callService(url, file);
    }

    /**
     * 调用 6 轨分离接口（Demucs）
     * Python 接口：POST /separate/demucs6
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     * @throws AudioServiceCallException 当调用失败时抛出
     */
    public String separateDemucs6(MultipartFile file) {
        String url = properties.getBaseUrl() + "/separate/demucs6";
        return callService(url, file);
    }

    /**
     * 通用服务调用方法
     *
     * @param url  完整的服务 URL
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     * @throws AudioServiceCallException 当调用失败时抛出
     */
    private String callService(String url, MultipartFile file) {
        try {
            // 创建 multipart/form-data 请求体
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // 关键：使用 Spring 自动生成的 FileSystemResource
            File temp = File.createTempFile("upload-", file.getOriginalFilename());
            file.transferTo(temp);

            FileSystemResource resource = new FileSystemResource(temp);
            body.add("file", resource);   // 字段名必须是 file

            HttpHeaders headers = new HttpHeaders();
            // ❌ 不要手动设置 Content-Type
            // headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(url, requestEntity, String.class);

            return response != null ? response : "";

        } catch (RestClientException e) {
            throw new AudioServiceCallException(
                "调用 AI 服务失败: " + url + ", 错误: " + e.getMessage(),
                e
            );
        } catch (Exception e) {
            throw new AudioServiceCallException(
                "处理文件时发生错误: " + e.getMessage(),
                e
            );
        }
    }
}




