package com.creativehub.media.exception;

import com.creativehub.common.core.exception.BusinessException;

public class MediaServiceException extends BusinessException {

    public MediaServiceException(int code, String message) {
        super(code, message);
    }

    public MediaServiceException(int code, String message, Throwable cause) {
        super(code, message, cause);
    }
}


