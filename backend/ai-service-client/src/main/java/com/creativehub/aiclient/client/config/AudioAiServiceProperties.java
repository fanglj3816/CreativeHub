package com.creativehub.aiclient.client.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * AI 服务配置属性类
 * 从配置文件中读取 AI 服务的配置信息
 */
@ConfigurationProperties(prefix = "ai.service")
public class AudioAiServiceProperties {

    /**
     * AI 服务的基础 URL
     * 默认值：http://localhost:8001
     */
    private String baseUrl = "http://localhost:8001";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
