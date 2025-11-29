package com.creativehub.userpost.service;

import com.creativehub.userpost.dto.CreatePostRequest;
import com.creativehub.userpost.dto.PostDTO;
import org.springframework.data.domain.Page;

public interface PostService {

    Long createPost(CreatePostRequest request, Long userId);

    PostDTO getPostDetail(Long postId);

    Page<PostDTO> getFeed(int page, int pageSize);

    Page<PostDTO> searchPosts(String keyword, int page, int pageSize);

    /**
     * 删除帖子
     * @param postId 帖子 ID
     * @param userId 用户 ID（用于权限验证）
     */
    void deletePost(Long postId, Long userId);
}


