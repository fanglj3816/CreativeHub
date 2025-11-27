package com.creativehub.userpost.dto;

import jakarta.validation.constraints.NotNull;

public class MediaItemDTO {

    @NotNull
    private Long mediaId;

    @NotNull
    private String type;

    private Integer sortOrder;

    public Long getMediaId() {
        return mediaId;
    }

    public void setMediaId(Long mediaId) {
        this.mediaId = mediaId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}


