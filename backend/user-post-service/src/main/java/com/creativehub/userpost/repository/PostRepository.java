package com.creativehub.userpost.repository;

import com.creativehub.userpost.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * 根据关键词搜索帖子内容
     * @param keyword 搜索关键词
     * @param pageable 分页参数
     * @return 匹配的帖子分页结果
     */
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:keyword% AND p.status = 1 ORDER BY p.createdAt DESC")
    Page<Post> searchByContent(@Param("keyword") String keyword, Pageable pageable);
}


