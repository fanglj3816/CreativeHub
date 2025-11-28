package com.creativehub.userpost.exception;

import com.creativehub.common.core.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(PostServiceException.class)
    public ResponseEntity<ApiResponse<Void>> handlePostService(PostServiceException ex) {
        log.warn("业务异常: {}", ex.getMessage());
        HttpStatus status = mapStatus(ex.getCode());
        return new ResponseEntity<>(ApiResponse.error(ex.getCode(), ex.getMessage()), status);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiResponse<Void>> handleValidation(Exception ex) {
        String message = "参数校验失败";
        if (ex instanceof MethodArgumentNotValidException manve) {
            message = manve.getBindingResult().getFieldError() != null
                ? manve.getBindingResult().getFieldError().getDefaultMessage()
                : message;
        } else if (ex instanceof ConstraintViolationException cve) {
            message = cve.getConstraintViolations().stream()
                .findFirst()
                .map(cv -> cv.getMessage())
                .orElse(message);
        }
        return new ResponseEntity<>(ApiResponse.error(400, message), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        log.error("系统异常", ex);
        return new ResponseEntity<>(ApiResponse.error(500, "系统繁忙，请稍后再试"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    private HttpStatus mapStatus(int code) {
        return switch (code) {
            case 401 -> HttpStatus.UNAUTHORIZED;
            case 404 -> HttpStatus.NOT_FOUND;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}


