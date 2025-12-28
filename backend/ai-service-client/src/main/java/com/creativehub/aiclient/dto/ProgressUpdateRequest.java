package com.creativehub.aiclient.dto;

/**
 * 进度更新请求
 * 用于 Python 服务回调更新任务进度
 */
public class ProgressUpdateRequest {
    private Integer progress; // 0-100
    private String message; // 可选描述

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}




