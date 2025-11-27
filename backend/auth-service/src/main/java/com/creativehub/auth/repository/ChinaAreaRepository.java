package com.creativehub.auth.repository;

import com.creativehub.auth.entity.ChinaArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChinaAreaRepository extends JpaRepository<ChinaArea, String> {
    
    // 根据层级查询
    List<ChinaArea> findByLevel(Integer level);
    
    // 根据父级ID查询子级区域
    List<ChinaArea> findByParentId(String parentId);
    
    // 根据父级ID和层级查询
    List<ChinaArea> findByParentIdAndLevel(String parentId, Integer level);
}

