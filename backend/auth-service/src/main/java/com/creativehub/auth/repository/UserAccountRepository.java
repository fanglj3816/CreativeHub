package com.creativehub.auth.repository;

import com.creativehub.auth.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    
    Optional<UserAccount> findByEmail(String email);
    
    Optional<UserAccount> findByUsername(String username);
    
    Optional<UserAccount> findByPhone(String phone);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByPhone(String phone);
}





