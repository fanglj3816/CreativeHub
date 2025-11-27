package com.creativehub.userpost.client;

import com.creativehub.userpost.dto.ApiResponse;
import com.creativehub.userpost.dto.MediaDTO;
import java.util.Collection;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "media-service",
    contextId = "mediaClient",
    url = "${media-service.base-url:http://media-service}",
    path = "/media")
public interface MediaClient {

    @GetMapping("/batch")
    ApiResponse<List<MediaDTO>> getMediaByIds(@RequestParam("ids") Collection<Long> ids);
}


