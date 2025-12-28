package com.creativehub.aiclient.dto;

import java.util.List;

/**
 * 任务状态查询响应
 * 用于前端轮询任务状态
 */
public class TaskStatusResponse {
    private Long taskId;
    private String status; // PENDING / PROCESSING / SUCCESS / FAILED
    private Integer progress; // 0-100
    private String vocalUrl;
    private String instUrl;
    private List<String> trackUrls;
    private String errorMsg;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getVocalUrl() {
        return vocalUrl;
    }

    public void setVocalUrl(String vocalUrl) {
        this.vocalUrl = vocalUrl;
    }

    public String getInstUrl() {
        return instUrl;
    }

    public void setInstUrl(String instUrl) {
        this.instUrl = instUrl;
    }

    public List<String> getTrackUrls() {
        return trackUrls;
    }

    public void setTrackUrls(List<String> trackUrls) {
        this.trackUrls = trackUrls;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }
}








