package com.creativehub.userpost.exception;

import com.creativehub.common.core.exception.BusinessException;

public class PostServiceException extends BusinessException {

    public PostServiceException(int code, String message) {
        super(code, message);
    }

    public PostServiceException(int code, String message, Throwable cause) {
        super(code, message, cause);
    }
}


