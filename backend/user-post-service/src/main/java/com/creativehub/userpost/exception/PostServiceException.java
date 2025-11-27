package com.creativehub.userpost.exception;

public class PostServiceException extends RuntimeException {

    private final int code;

    public PostServiceException(int code, String message) {
        super(message);
        this.code = code;
    }

    public PostServiceException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}


