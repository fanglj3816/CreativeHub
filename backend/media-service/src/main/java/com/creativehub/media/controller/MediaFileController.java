package com.creativehub.media.controller;

import com.creativehub.common.core.dto.ApiResponse;
import com.creativehub.common.core.dto.MediaDTO;
import com.creativehub.common.security.JwtUserResolver;
import com.creativehub.media.dto.UploadResponse;
import com.creativehub.media.service.MediaFileService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    public ApiResponse<MediaDTO> uploadMedia(@RequestPart("file") MultipartFile file,
                                             HttpServletRequest request) {
        Long userId = jwtUserResolver.resolveUserId(request);
        // 上传后返回MediaDTO，包含status和progress信息
        UploadResponse uploadResponse = mediaFileService.uploadMedia(file, userId);
        // 获取完整的媒体信息（包含status/progress）
        MediaDTO mediaDTO = mediaFileService.getMediaStatus(uploadResponse.getId());
        return ApiResponse.success(mediaDTO);
    }

    @GetMapping("/batch")
    public ApiResponse<List<MediaDTO>> getMediaByIds(@RequestParam("ids") List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ApiResponse.success(java.util.Collections.emptyList());
        }
        List<MediaDTO> mediaList = mediaFileService.getMediaByIds(ids);
        return ApiResponse.success(mediaList);
    }

    @DeleteMapping("/batch")
    public ApiResponse<Void> deleteMediaBatch(@RequestParam("ids") List<Long> ids) {
        mediaFileService.deleteMediaByIds(ids);
        return ApiResponse.success(null);
    }

    /**
     * 查询媒体文件转码状态（用于前端轮询）
     */
    @GetMapping("/status/{mediaId}")
    public ApiResponse<MediaDTO> getMediaStatus(@PathVariable("mediaId") Long mediaId) {
        MediaDTO mediaDTO = mediaFileService.getMediaStatus(mediaId);
        return ApiResponse.success(mediaDTO);
    }
}


