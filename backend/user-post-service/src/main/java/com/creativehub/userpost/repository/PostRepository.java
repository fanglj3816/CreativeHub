package com.creativehub.userpost.repository;

import com.creativehub.userpost.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}


