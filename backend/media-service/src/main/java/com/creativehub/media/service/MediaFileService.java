package com.creativehub.media.service;

import com.creativehub.media.dto.MediaDTO;
import com.creativehub.media.dto.UploadResponse;
import java.util.Collection;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface MediaFileService {

    UploadResponse uploadMedia(MultipartFile file, Long ownerId);

    /**
     * 批量获取媒体文件信息
     * @param ids 媒体文件 ID 列表
     * @return 媒体文件 DTO 列表
     */
    List<MediaDTO> getMediaByIds(Collection<Long> ids);
}


