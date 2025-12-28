package com.creativehub.media.dto;

import java.io.Serial;
import java.io.Serializable;

/**
 * 视频转码任务消息体
 * 用于 RabbitMQ 消息传递
 */
public class MediaTranscodeMessage implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long mediaId;
    private String bucket;
    private String originalObjectKey;
    private String originalName;
    private Long ownerId;

    public MediaTranscodeMessage() {
    }

    public MediaTranscodeMessage(Long mediaId, String bucket, String originalObjectKey, String originalName, Long ownerId) {
        this.mediaId = mediaId;
        this.bucket = bucket;
        this.originalObjectKey = originalObjectKey;
        this.originalName = originalName;
        this.ownerId = ownerId;
    }

    public Long getMediaId() {
        return mediaId;
    }

    public void setMediaId(Long mediaId) {
        this.mediaId = mediaId;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getOriginalObjectKey() {
        return originalObjectKey;
    }

    public void setOriginalObjectKey(String originalObjectKey) {
        this.originalObjectKey = originalObjectKey;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    @Override
    public String toString() {
        return "MediaTranscodeMessage{" +
            "mediaId=" + mediaId +
            ", bucket='" + bucket + '\'' +
            ", originalObjectKey='" + originalObjectKey + '\'' +
            ", originalName='" + originalName + '\'' +
            ", ownerId=" + ownerId +
            '}';
    }
}














