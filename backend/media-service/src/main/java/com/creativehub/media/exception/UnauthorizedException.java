package com.creativehub.media.exception;

public class UnauthorizedException extends MediaServiceException {

    public UnauthorizedException(String message) {
        super(401, message);
    }
}


