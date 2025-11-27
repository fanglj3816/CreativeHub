package com.creativehub.media.exception;

public class MediaServiceException extends RuntimeException {

    private final int code;

    public MediaServiceException(int code, String message) {
        super(message);
        this.code = code;
    }

    public MediaServiceException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}


