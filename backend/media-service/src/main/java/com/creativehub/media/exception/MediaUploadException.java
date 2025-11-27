package com.creativehub.media.exception;

public class MediaUploadException extends MediaServiceException {

    public MediaUploadException(String message) {
        super(1001, message);
    }

    public MediaUploadException(String message, Throwable cause) {
        super(1001, message, cause);
    }
}


