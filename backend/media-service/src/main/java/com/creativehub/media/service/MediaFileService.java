package com.creativehub.media.service;

import com.creativehub.common.core.dto.MediaDTO;
import java.util.Collection;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface MediaFileService {

    /**
     * 上传媒体文件（支持自动视频转码）
     * @param file 文件
     * @param ownerId 所有者 ID
     * @return 媒体文件 DTO
     */
    MediaDTO uploadMedia(MultipartFile file, Long ownerId);

    /**
     * 批量获取媒体文件信息
     * @param ids 媒体文件 ID 列表
     * @return 媒体文件 DTO 列表
     */
    List<MediaDTO> getMediaByIds(Collection<Long> ids);
}


