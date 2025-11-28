package com.creativehub.userpost.repository;

import com.creativehub.userpost.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    
    /**
     * 根据用户 ID 查找用户资料
     * @param userId 用户 ID
     * @return 用户资料，如果不存在则返回空
     */
    Optional<UserProfile> findByUserId(Long userId);
}

