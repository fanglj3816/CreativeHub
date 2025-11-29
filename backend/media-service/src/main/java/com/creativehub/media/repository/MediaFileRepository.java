package com.creativehub.media.repository;

import com.creativehub.media.entity.MediaFile;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    /**
     * 根据 MD5 值和用户ID查找媒体文件（用于文件去重）
     * MD5 是基于文件内容和用户ID一起计算的，确保不同用户上传相同文件时不会冲突
     * @param md5 文件内容和用户ID的 MD5 哈希值
     * @param ownerId 用户ID
     * @return 如果找到相同 MD5 和用户ID 的文件则返回，否则返回空
     */
    Optional<MediaFile> findByMd5AndOwnerId(String md5, Long ownerId);

    /**
     * 根据 ID 列表批量查询媒体文件
     * @param ids 媒体文件 ID 列表
     * @return 媒体文件列表
     */
    List<MediaFile> findByIdIn(Collection<Long> ids);
}


