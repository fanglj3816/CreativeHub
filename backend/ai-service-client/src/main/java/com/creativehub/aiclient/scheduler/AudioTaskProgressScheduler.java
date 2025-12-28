package com.creativehub.aiclient.scheduler;

import com.creativehub.aiclient.entity.MediaTask;
import com.creativehub.aiclient.repository.MediaTaskRepository;
import com.creativehub.aiclient.service.AudioAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 音频任务伪进度调度器
 * 当任务长时间处于 PROCESSING 状态时，让进度缓慢上涨到某个上限
 */
@Component
public class AudioTaskProgressScheduler {

    private static final Logger log = LoggerFactory.getLogger(AudioTaskProgressScheduler.class);

    // 伪进度范围
    private static final int MIN_FAKE_PROGRESS = 5;
    private static final int MAX_FAKE_PROGRESS = 80;
    
    // 每次增加的步长
    private static final int PROGRESS_STEP = 2;

    private final MediaTaskRepository mediaTaskRepository;

    public AudioTaskProgressScheduler(MediaTaskRepository mediaTaskRepository) {
        this.mediaTaskRepository = mediaTaskRepository;
    }

    /**
     * 每 5 秒执行一次，提升处理中任务的伪进度
     */
    @Scheduled(fixedDelay = 5000)
    public void boostProgress() {
        try {
            // 查询需要伪进度的任务
            // 条件：status = PROCESSING 且 progress 在 [MIN_FAKE_PROGRESS, MAX_FAKE_PROGRESS) 之间
            List<MediaTask> tasks = mediaTaskRepository.findByStatusAndProgressBetween(
                AudioAiService.STATUS_PROCESSING,
                MIN_FAKE_PROGRESS,
                MAX_FAKE_PROGRESS - 1 // 不包括 MAX_FAKE_PROGRESS
            );

            for (MediaTask task : tasks) {
                try {
                    Integer currentProgress = task.getProgress() == null ? 0 : task.getProgress();
                    
                    // 计算新进度：不超过 MAX_FAKE_PROGRESS
                    int newProgress = Math.min(currentProgress + PROGRESS_STEP, MAX_FAKE_PROGRESS);
                    
                    if (newProgress > currentProgress) {
                        task.setProgress(newProgress);
                        mediaTaskRepository.save(task);
                        
                        log.debug("Boosted fake progress: taskId={}, {} -> {}", 
                            task.getId(), currentProgress, newProgress);
                    }
                } catch (Exception e) {
                    log.warn("Failed to boost progress for task {}: {}", task.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error in boostProgress scheduler", e);
        }
    }
}




