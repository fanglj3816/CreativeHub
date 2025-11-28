package com.creativehub.userpost.client;

import com.creativehub.common.core.dto.ApiResponse;
import com.creativehub.common.core.dto.MediaDTO;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "media-service",
    contextId = "mediaClient",
    path = "/media")
public interface MediaClient {

    @GetMapping("/batch")
    ApiResponse<List<MediaDTO>> getMediaByIds(@RequestParam("ids") List<Long> ids);
}


