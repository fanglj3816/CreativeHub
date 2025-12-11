package com.creativehub.aiclient.service;

import com.creativehub.aiclient.client.MediaClient;
import com.creativehub.aiclient.client.PythonAudioClient;
import com.creativehub.aiclient.entity.MediaTask;
import com.creativehub.aiclient.repository.MediaTaskRepository;
import com.creativehub.common.core.dto.MediaDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

/**
 * AI 音频处理业务服务
 * 对外提供音频分离相关的业务方法
 */
@Service
public class AudioAiService {

    private static final Logger log = LoggerFactory.getLogger(AudioAiService.class);

    private final MediaTaskRepository mediaTaskRepository;
    private final MediaClient mediaClient;
    private final PythonAudioClient pythonAudioClient;
    private final Executor audioSeparationExecutor;
    private final ObjectMapper objectMapper;

    // 任务类型常量
    public static final String TASK_TYPE_VOCAL = "AUDIO_SEPARATION_VOCAL";
    public static final String TASK_TYPE_STEM4 = "AUDIO_SEPARATION_STEM4";
    public static final String TASK_TYPE_STEM6 = "AUDIO_SEPARATION_STEM6";

    // 状态常量
    public static final int STATUS_PENDING = 0;
    public static final int STATUS_PROCESSING = 1;
    public static final int STATUS_SUCCESS = 2;
    public static final int STATUS_FAILED = 3;

    public AudioAiService(
        MediaTaskRepository mediaTaskRepository,
        MediaClient mediaClient,
        PythonAudioClient pythonAudioClient,
        @Qualifier("audioSeparationExecutor") Executor audioSeparationExecutor,
        ObjectMapper objectMapper
    ) {
        this.mediaTaskRepository = mediaTaskRepository;
        this.mediaClient = mediaClient;
        this.pythonAudioClient = pythonAudioClient;
        this.audioSeparationExecutor = audioSeparationExecutor;
        this.objectMapper = objectMapper;
    }

    /**
     * 创建人声/伴奏分离任务
     *
     * @param mediaId 媒体文件ID
     * @return 任务ID
     */
    @Transactional
    public Long createVocalSeparationTask(Long mediaId) {
        return createAudioSeparationTask(mediaId, "VOCAL", TASK_TYPE_VOCAL);
    }

    /**
     * 创建 4 轨分离任务（Demucs）
     *
     * @param mediaId 媒体文件ID
     * @return 任务ID
     */
    @Transactional
    public Long createDemucs4SeparationTask(Long mediaId) {
        return createAudioSeparationTask(mediaId, "STEM4", TASK_TYPE_STEM4);
    }

    /**
     * 创建 6 轨分离任务（Demucs）
     *
     * @param mediaId 媒体文件ID
     * @return 任务ID
     */
    @Transactional
    public Long createDemucs6SeparationTask(Long mediaId) {
        return createAudioSeparationTask(mediaId, "STEM6", TASK_TYPE_STEM6);
    }

    /**
     * 创建音频分离任务的通用方法
     *
     * @param mediaId 媒体文件ID
     * @param mode 分离模式（VOCAL / STEM4 / STEM6）
     * @param taskType 任务类型
     * @return 任务ID
     */
    private Long createAudioSeparationTask(Long mediaId, String mode, String taskType) {
        // 1. 查询媒体文件信息
        MediaDTO mediaDTO = mediaClient.getMediaStatus(mediaId).getData();
        if (mediaDTO == null) {
            throw new RuntimeException("媒体文件不存在: " + mediaId);
        }

        if (mediaDTO.getUrl() == null || mediaDTO.getUrl().isEmpty()) {
            throw new RuntimeException("媒体文件 URL 为空: " + mediaId);
        }

        // 2. 构建 taskParams JSON
        Map<String, Object> taskParams = new HashMap<>();
        taskParams.put("mode", mode);
        taskParams.put("inputUrl", mediaDTO.getUrl());
        // 保存文件名，用于调用 Python 服务
        String fileName = mediaDTO.getDisplayName();
        if (fileName == null || fileName.isEmpty()) {
            // 从 URL 中提取文件名
            String url = mediaDTO.getUrl();
            int lastSlash = url.lastIndexOf('/');
            int lastDot = url.lastIndexOf('.');
            if (lastDot > lastSlash && lastDot > 0) {
                fileName = url.substring(lastSlash + 1);
            } else {
                fileName = "audio.mp3"; // 默认文件名
            }
        }
        taskParams.put("fileName", fileName);
        taskParams.put("vocalUrl", null);
        taskParams.put("instUrl", null);
        taskParams.put("trackUrls", null);

        String taskParamsJson;
        try {
            taskParamsJson = objectMapper.writeValueAsString(taskParams);
        } catch (Exception e) {
            log.error("Failed to serialize taskParams to JSON: mediaId={}", mediaId, e);
            throw new RuntimeException("创建任务参数失败", e);
        }

        // 3. 创建任务记录
        MediaTask task = new MediaTask();
        task.setMediaId(mediaId);
        task.setTaskType(taskType);
        task.setStatus(STATUS_PENDING);
        task.setProgress(0);
        task.setTaskParams(taskParamsJson);
        task = mediaTaskRepository.save(task);

        log.info("Audio separation task created: taskId={}, mediaId={}, taskType={}", 
            task.getId(), mediaId, taskType);

        return task.getId();
    }

    /**
     * 提交音频分离任务到线程池异步执行
     *
     * @param taskId 任务ID
     */
    public void submitAudioSeparationTask(Long taskId) {
        log.info("Submitting audio separation task to thread pool: taskId={}", taskId);
        audioSeparationExecutor.execute(() -> {
            try {
                runAudioSeparationTask(taskId);
            } catch (Exception e) {
                log.error("Error executing audio separation task: taskId={}", taskId, e);
            }
        });
    }

    /**
     * 后台线程执行音频分离任务的核心逻辑
     *
     * @param taskId 任务ID
     */
    private void runAudioSeparationTask(Long taskId) {
        log.info("Starting audio separation task execution: taskId={}", taskId);

        MediaTask task = null;
        try {
            // 1. 查询任务
            task = mediaTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

            // 2. 解析 taskParams 获取 inputUrl 和 mode
            Map<String, Object> taskParams = parseTaskParams(task.getTaskParams());
            String inputUrl = (String) taskParams.get("inputUrl");
            String mode = (String) taskParams.get("mode");

            if (inputUrl == null || inputUrl.isEmpty()) {
                throw new RuntimeException("Input URL is empty in taskParams");
            }

            // 3. 更新任务状态为处理中
            task.setStatus(STATUS_PROCESSING);
            task.setProgress(5);
            mediaTaskRepository.save(task);

            // 4. 根据 mode 调用不同的 Python 接口
            Map<String, Object> updatedParams = new HashMap<>(taskParams);
            
            // 获取文件名（从 taskParams 中获取，如果不存在则从 URL 中提取）
            String fileName = (String) taskParams.get("fileName");
            if (fileName == null || fileName.isEmpty()) {
                // 从 URL 中提取文件名
                int lastSlash = inputUrl.lastIndexOf('/');
                int lastDot = inputUrl.lastIndexOf('.');
                if (lastDot > lastSlash && lastDot > 0) {
                    fileName = inputUrl.substring(lastSlash + 1);
                } else {
                    fileName = "audio.mp3";
                }
            }
            
            if ("VOCAL".equals(mode)) {
                PythonAudioClient.VocalSeparationResult result = pythonAudioClient.separateVocal(
                    taskId, inputUrl, fileName
                );
                updatedParams.put("vocalUrl", result.getVocalUrl());
                updatedParams.put("instUrl", result.getInstrumentalUrl());
            } else if ("STEM4".equals(mode)) {
                PythonAudioClient.StemSeparationResult result = pythonAudioClient.separateStem4(
                    taskId, inputUrl, fileName
                );
                updatedParams.put("trackUrls", result.getTrackUrls());
            } else if ("STEM6".equals(mode)) {
                PythonAudioClient.StemSeparationResult result = pythonAudioClient.separateStem6(
                    taskId, inputUrl, fileName
                );
                updatedParams.put("trackUrls", result.getTrackUrls());
            } else {
                throw new RuntimeException("Unknown separation mode: " + mode);
            }

            // 5. 更新任务为成功
            task.setStatus(STATUS_SUCCESS);
            task.setProgress(100);
            task.setErrorMsg(null);
            task.setTaskParams(objectMapper.writeValueAsString(updatedParams));
            mediaTaskRepository.save(task);

            log.info("Audio separation task completed successfully: taskId={}", taskId);

        } catch (Exception e) {
            log.error("Audio separation task failed: taskId={}", taskId, e);
            
            // 更新任务为失败
            if (task != null) {
                try {
                    task.setStatus(STATUS_FAILED);
                    task.setProgress(task.getProgress() > 0 ? task.getProgress() : 100);
                    task.setErrorMsg(e.getMessage() != null ? e.getMessage() : "未知错误");
                    mediaTaskRepository.save(task);
                } catch (Exception saveException) {
                    log.error("Failed to update task status to failed: taskId={}", taskId, saveException);
                }
            }
        }
    }

    /**
     * 解析 taskParams JSON 字符串
     */
    private Map<String, Object> parseTaskParams(String taskParamsJson) {
        try {
            if (taskParamsJson == null || taskParamsJson.isEmpty()) {
                return new HashMap<>();
            }
            return objectMapper.readValue(taskParamsJson, Map.class);
        } catch (Exception e) {
            log.error("Failed to parse taskParams JSON: {}", taskParamsJson, e);
            throw new RuntimeException("解析任务参数失败", e);
        }
    }

    /**
     * 根据 taskId 查询任务
     *
     * @param taskId 任务ID
     * @return MediaTask
     */
    public MediaTask getTaskById(Long taskId) {
        return mediaTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
    }

    /**
     * 保存任务（供外部调用，如进度更新接口）
     *
     * @param task 任务实体
     */
    @Transactional
    public void saveTask(MediaTask task) {
        mediaTaskRepository.save(task);
    }
}
