package com.creativehub.userpost.controller;

import com.creativehub.userpost.dto.ApiResponse;
import com.creativehub.userpost.dto.CreatePostRequest;
import com.creativehub.userpost.dto.PageResponse;
import com.creativehub.userpost.dto.PostDTO;
import com.creativehub.userpost.service.PostService;
import com.creativehub.userpost.util.JwtUserResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;
    private final JwtUserResolver jwtUserResolver;

    public PostController(PostService postService, JwtUserResolver jwtUserResolver) {
        this.postService = postService;
        this.jwtUserResolver = jwtUserResolver;
    }

    @PostMapping
    public ApiResponse<Long> createPost(@Valid @RequestBody CreatePostRequest request,
                                        HttpServletRequest httpServletRequest) {
        Long userId = jwtUserResolver.resolveUserId(httpServletRequest);
        Long postId = postService.createPost(request, userId);
        return ApiResponse.success(postId);
    }

    @GetMapping("/{id}")
    public ApiResponse<PostDTO> getPost(@PathVariable("id") Long id) {
        PostDTO postDTO = postService.getPostDetail(id);
        return ApiResponse.success(postDTO);
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<PostDTO>> searchPosts(@RequestParam("keyword") String keyword,
                                                          @RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "10") int pageSize) {
        Page<PostDTO> postPage = postService.searchPosts(keyword, page, pageSize);
        PageResponse<PostDTO> response = new PageResponse<>(
            postPage.getContent(),
            page,
            postPage.getSize(),
            postPage.getTotalElements());
        return ApiResponse.success(response);
    }

    @GetMapping
    public ApiResponse<PageResponse<PostDTO>> getFeed(@RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "10") int pageSize) {
        Page<PostDTO> postPage = postService.getFeed(page, pageSize);
        PageResponse<PostDTO> response = new PageResponse<>(
            postPage.getContent(),
            page,
            postPage.getSize(),
            postPage.getTotalElements());
        return ApiResponse.success(response);
    }
}


