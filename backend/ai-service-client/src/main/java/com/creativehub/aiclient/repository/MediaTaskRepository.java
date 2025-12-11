package com.creativehub.aiclient.repository;

import com.creativehub.aiclient.entity.MediaTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 媒体任务 Repository
 */
@Repository
public interface MediaTaskRepository extends JpaRepository<MediaTask, Long> {

    /**
     * 根据媒体ID和任务类型查询任务
     */
    List<MediaTask> findByMediaIdAndTaskType(Long mediaId, String taskType);

    /**
     * 根据状态查询任务
     */
    List<MediaTask> findByStatus(Integer status);

    /**
     * 查询状态为指定值且进度在指定范围内的任务
     * 用于伪进度调度器
     */
    @Query("SELECT t FROM MediaTask t WHERE t.status = :status AND t.progress >= :minProgress AND t.progress < :maxProgress")
    List<MediaTask> findByStatusAndProgressBetween(
        @Param("status") Integer status,
        @Param("minProgress") Integer minProgress,
        @Param("maxProgress") Integer maxProgress
    );
}





