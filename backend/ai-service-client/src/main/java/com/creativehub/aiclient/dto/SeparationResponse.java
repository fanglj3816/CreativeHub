package com.creativehub.aiclient.dto;

/**
 * 音频分离响应
 */
public class SeparationResponse {
    private Integer code;
    private String message;
    private Long taskId;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
}







