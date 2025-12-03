package com.creativehub.aiclient.client.util;

import org.springframework.core.io.InputStreamResource;

import java.io.InputStream;

/**
 * MultipartFile 资源包装类
 * 用于将 MultipartFile 转换为 Spring Resource，以便通过 RestTemplate 发送
 */
public class MultipartInputStreamFileResource extends InputStreamResource {

    private final String filename;
    private final long contentLength;

    /**
     * 构造函数
     *
     * @param inputStream   输入流
     * @param filename      文件名
     * @param contentLength 文件大小（字节）
     */
    public MultipartInputStreamFileResource(InputStream inputStream, String filename, long contentLength) {
        super(inputStream);
        this.filename = filename;
        this.contentLength = contentLength;
    }

    @Override
    public String getFilename() {
        return filename;
    }

    @Override
    public long contentLength() {
        return contentLength;
    }

    @Override
    public boolean exists() {
        return true;
    }
}




