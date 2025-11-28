package com.creativehub.userpost.service;

import com.creativehub.userpost.dto.CreatePostRequest;
import com.creativehub.userpost.dto.PostDTO;
import org.springframework.data.domain.Page;

public interface PostService {

    Long createPost(CreatePostRequest request, Long userId);

    PostDTO getPostDetail(Long postId);

    Page<PostDTO> getFeed(int page, int pageSize);

    Page<PostDTO> searchPosts(String keyword, int page, int pageSize);
}


