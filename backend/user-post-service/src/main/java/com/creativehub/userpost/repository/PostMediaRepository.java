package com.creativehub.userpost.repository;

import com.creativehub.userpost.entity.PostMedia;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

    List<PostMedia> findByPostId(Long postId);

    List<PostMedia> findByPostIdIn(Collection<Long> postIds);

    /**
     * 统计使用指定媒体文件的帖子数量
     * @param mediaId 媒体文件 ID
     * @return 使用该媒体的帖子数量
     */
    long countByMediaId(Long mediaId);
}