package com.creativehub.aiclient.dto;

import java.util.List;

/**
 * 任务状态更新请求
 * 用于 Python 服务回调更新任务状态
 */
public class TaskStatusUpdateRequest {
    private Integer status; // 0=待处理 1=处理中 2=成功 3=失败
    private Integer progress; // 0-100
    private String errorMsg;
    private List<String> resultUrls; // 结果文件URL列表

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public List<String> getResultUrls() {
        return resultUrls;
    }

    public void setResultUrls(List<String> resultUrls) {
        this.resultUrls = resultUrls;
    }
}







