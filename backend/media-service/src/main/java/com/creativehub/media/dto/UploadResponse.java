package com.creativehub.media.dto;

public class UploadResponse {

    private Long id;
    private String url;

    public UploadResponse() {
    }

    public UploadResponse(Long id, String url) {
        this.id = id;
        this.url = url;
    }

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
}


