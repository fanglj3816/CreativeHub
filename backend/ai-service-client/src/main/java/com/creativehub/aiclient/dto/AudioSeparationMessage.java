package com.creativehub.aiclient.dto;

import java.io.Serial;
import java.io.Serializable;

/**
 * 音频分离任务消息体
 * 用于 RabbitMQ 消息传递
 */
public class AudioSeparationMessage implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long taskId;
    private Long mediaId;
    private String taskType; // VOCAL, DEMUCS4, DEMUCS6
    private String fileUrl; // 媒体文件URL
    private String fileName; // 文件名

    public AudioSeparationMessage() {
    }

    public AudioSeparationMessage(Long taskId, Long mediaId, String taskType, String fileUrl, String fileName) {
        this.taskId = taskId;
        this.mediaId = mediaId;
        this.taskType = taskType;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getMediaId() {
        return mediaId;
    }

    public void setMediaId(Long mediaId) {
        this.mediaId = mediaId;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    @Override
    public String toString() {
        return "AudioSeparationMessage{" +
            "taskId=" + taskId +
            ", mediaId=" + mediaId +
            ", taskType='" + taskType + '\'' +
            ", fileUrl='" + fileUrl + '\'' +
            ", fileName='" + fileName + '\'' +
            '}';
    }
}







