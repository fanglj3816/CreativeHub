package com.creativehub.media.service;

import com.creativehub.common.core.dto.MediaDTO;
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

    /**
     * 批量删除媒体文件，包括从 MinIO 和数据库中删除
     * @param ids 媒体文件 ID 列表
     */
    void deleteMediaByIds(Collection<Long> ids);

    /**
     * 获取媒体文件状态（用于前端轮询）
     * @param mediaId 媒体文件 ID
     * @return MediaDTO 包含 status/progress/errorMsg 等信息
     */
    MediaDTO getMediaStatus(Long mediaId);
}


