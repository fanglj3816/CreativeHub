package com.creativehub.common.core.dto;

/**
 * 媒体文件的通用描述，供各服务之间传输使用。
 */
public class MediaDTO {

    private Long id;
    private String url;
    private String fileType;
    private Integer width;
    private Integer height;
    private Integer durationSec;
    private String displayName;
    private Integer status; // 0=完成 1=处理中 2=失败
    private java.math.BigDecimal progress; // 转码进度 0~1
    private String errorMsg; // 转码失败原因

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getDurationSec() {
        return durationSec;
    }

    public void setDurationSec(Integer durationSec) {
        this.durationSec = durationSec;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public java.math.BigDecimal getProgress() {
        return progress;
    }

    public void setProgress(java.math.BigDecimal progress) {
        this.progress = progress;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }
}




