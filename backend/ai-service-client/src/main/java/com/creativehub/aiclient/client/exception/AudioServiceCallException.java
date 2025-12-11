package com.creativehub.aiclient.client.exception;

/**
 * AI 服务调用异常
 * 当调用 Python AI 服务时发生错误时抛出
 */
public class AudioServiceCallException extends RuntimeException {

    public AudioServiceCallException(String message) {
        super(message);
    }

    public AudioServiceCallException(String message, Throwable cause) {
        super(message, cause);
    }
}










