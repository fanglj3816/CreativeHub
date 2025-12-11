package com.creativehub.aiclient.client;

import com.creativehub.common.core.dto.ApiResponse;
import com.creativehub.common.core.dto.MediaDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Media Service Feign Client
 * 用于调用 media-service 获取媒体文件信息
 */
@FeignClient(name = "media-service",
    contextId = "mediaClient",
    path = "/media")
public interface MediaClient {

    /**
     * 获取媒体文件状态
     * @param mediaId 媒体文件 ID
     * @return MediaDTO 包含文件信息
     */
    @GetMapping("/status/{mediaId}")
    ApiResponse<MediaDTO> getMediaStatus(@PathVariable("mediaId") Long mediaId);
}







