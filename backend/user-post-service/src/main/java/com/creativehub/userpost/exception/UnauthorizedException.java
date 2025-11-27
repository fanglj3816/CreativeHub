package com.creativehub.userpost.exception;

public class UnauthorizedException extends PostServiceException {

    public UnauthorizedException(String message) {
        super(401, message);
    }
}


