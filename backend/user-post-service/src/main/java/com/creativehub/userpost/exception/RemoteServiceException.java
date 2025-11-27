package com.creativehub.userpost.exception;

public class RemoteServiceException extends PostServiceException {

    public RemoteServiceException(String message) {
        super(500, message);
    }

    public RemoteServiceException(String message, Throwable cause) {
        super(500, message, cause);
    }
}


