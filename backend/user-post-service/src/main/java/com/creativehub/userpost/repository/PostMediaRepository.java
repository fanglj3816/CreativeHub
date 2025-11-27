package com.creativehub.userpost.repository;

import com.creativehub.userpost.entity.PostMedia;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

    List<PostMedia> findByPostId(Long postId);

    List<PostMedia> findByPostIdIn(Collection<Long> postIds);
}