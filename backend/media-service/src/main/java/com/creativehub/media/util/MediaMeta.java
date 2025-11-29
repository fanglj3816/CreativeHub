package com.creativehub.media.util;

/**
 * 媒体文件元数据
 */
public class MediaMeta {
    private Integer width;
    private Integer height;
    private Integer durationSec;

    public MediaMeta() {
    }

    public MediaMeta(Integer width, Integer height, Integer durationSec) {
        this.width = width;
        this.height = height;
        this.durationSec = durationSec;
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
}

