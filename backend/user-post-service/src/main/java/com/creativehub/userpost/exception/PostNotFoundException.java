package com.creativehub.userpost.exception;

public class PostNotFoundException extends PostServiceException {

    public PostNotFoundException(Long postId) {
        super(404, "帖子不存在: " + postId);
    }
}


