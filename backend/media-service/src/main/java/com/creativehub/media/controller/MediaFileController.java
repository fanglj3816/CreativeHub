package com.creativehub.media.controller;

import com.creativehub.media.dto.ApiResponse;
import com.creativehub.media.dto.MediaDTO;
import com.creativehub.media.dto.UploadResponse;
import com.creativehub.media.security.JwtUserResolver;
import com.creativehub.media.service.MediaFileService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/media")
public class MediaFileController {

    private final MediaFileService mediaFileService;
    private final JwtUserResolver jwtUserResolver;

    public MediaFileController(MediaFileService mediaFileService, JwtUserResolver jwtUserResolver) {
        this.mediaFileService = mediaFileService;
        this.jwtUserResolver = jwtUserResolver;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UploadResponse> uploadMedia(@RequestPart("file") MultipartFile file,
                                                   HttpServletRequest request) {
        Long userId = jwtUserResolver.resolveUserId(request);
        UploadResponse response = mediaFileService.uploadMedia(file, userId);
        return ApiResponse.success(response);
    }

    @GetMapping("/batch")
    public ApiResponse<List<MediaDTO>> getMediaByIds(@RequestParam("ids") List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ApiResponse.success(java.util.Collections.emptyList());
        }
        List<MediaDTO> mediaList = mediaFileService.getMediaByIds(ids);
        return ApiResponse.success(mediaList);
    }
}


