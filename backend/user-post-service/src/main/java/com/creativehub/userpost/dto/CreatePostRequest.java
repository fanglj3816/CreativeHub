package com.creativehub.userpost.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreatePostRequest {

    @NotBlank(message = "帖子内容不能为空")
    private String content;

    @NotNull(message = "contentType 不能为空")
    private Integer contentType;

    private List<MediaItemDTO> mediaItems;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getContentType() {
        return contentType;
    }

    public void setContentType(Integer contentType) {
        this.contentType = contentType;
    }

    public List<MediaItemDTO> getMediaItems() {
        return mediaItems;
    }

    public void setMediaItems(List<MediaItemDTO> mediaItems) {
        this.mediaItems = mediaItems;
    }
}


