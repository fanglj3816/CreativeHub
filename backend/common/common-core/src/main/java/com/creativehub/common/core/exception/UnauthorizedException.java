package com.creativehub.common.core.exception;

/**
 * 通用未授权异常，返回 401 对应错误码。
 */
public class UnauthorizedException extends BusinessException {

    public UnauthorizedException(String message) {
        super(401, message);
    }
}









