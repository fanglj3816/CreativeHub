package com.creativehub.media.exception;

import com.creativehub.media.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MediaServiceException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaException(MediaServiceException ex) {
        log.warn("业务异常: {}", ex.getMessage());
        HttpStatus status = ex instanceof UnauthorizedException ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;
        return new ResponseEntity<>(ApiResponse.error(ex.getCode(), ex.getMessage()), status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        log.error("系统异常", ex);
        return new ResponseEntity<>(ApiResponse.error(500, "系统繁忙，请稍后再试"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


