package com.creativehub.aiclient.controller;

import com.creativehub.aiclient.dto.ProgressUpdateRequest;
import com.creativehub.aiclient.dto.SeparationRequest;
import com.creativehub.aiclient.dto.SeparationResponse;
import com.creativehub.aiclient.dto.TaskStatusResponse;
import com.creativehub.aiclient.entity.MediaTask;
import com.creativehub.aiclient.service.AudioAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI 音频处理控制器
 * 提供 REST API 接口调用 Python AI 服务
 */
@RestController
@RequestMapping("/audio")
public class AudioAiController {

    private static final Logger log = LoggerFactory.getLogger(AudioAiController.class);

    private final AudioAiService audioAiService;
    private final ObjectMapper objectMapper;

    public AudioAiController(AudioAiService audioAiService, ObjectMapper objectMapper) {
        this.audioAiService = audioAiService;
        this.objectMapper = objectMapper;
    }

    /**
     * 人声/伴奏分离接口
     * POST /audio/separation/vocal (通过 Gateway: /api/audio/separation/vocal)
     *
     * @param request 包含 mediaId 的请求
     * @return 任务ID
     */
    @PostMapping("/separation/vocal")
    public ResponseEntity<SeparationResponse> vocalSeparate(@RequestBody SeparationRequest request) {
        // 1. 创建任务
        Long taskId = audioAiService.createVocalSeparationTask(request.getMediaId());

        // 2. 提交到线程池异步执行
        audioAiService.submitAudioSeparationTask(taskId);

        // 3. 立即返回 taskId
        SeparationResponse response = new SeparationResponse();
        response.setCode(0);
        response.setMessage("success");
        response.setTaskId(taskId);
        return ResponseEntity.ok(response);
    }

    /**
     * 4 轨分离接口（Demucs）
     * POST /audio/separation/stem4 (通过 Gateway: /api/audio/separation/stem4)
     *
     * @param request 包含 mediaId 的请求
     * @return 任务ID
     */
    @PostMapping("/separation/stem4")
    public ResponseEntity<SeparationResponse> demucs4Separate(@RequestBody SeparationRequest request) {
        // 1. 创建任务
        Long taskId = audioAiService.createDemucs4SeparationTask(request.getMediaId());

        // 2. 提交到线程池异步执行
        audioAiService.submitAudioSeparationTask(taskId);

        // 3. 立即返回 taskId
        SeparationResponse response = new SeparationResponse();
        response.setCode(0);
        response.setMessage("success");
        response.setTaskId(taskId);
        return ResponseEntity.ok(response);
    }

    /**
     * 6 轨分离接口（Demucs）
     * POST /audio/separation/stem6 (通过 Gateway: /api/audio/separation/stem6)
     *
     * @param request 包含 mediaId 的请求
     * @return 任务ID
     */
    @PostMapping("/separation/stem6")
    public ResponseEntity<SeparationResponse> demucs6Separate(@RequestBody SeparationRequest request) {
        // 1. 创建任务
        Long taskId = audioAiService.createDemucs6SeparationTask(request.getMediaId());

        // 2. 提交到线程池异步执行
        audioAiService.submitAudioSeparationTask(taskId);

        // 3. 立即返回 taskId
        SeparationResponse response = new SeparationResponse();
        response.setCode(0);
        response.setMessage("success");
        response.setTaskId(taskId);
        return ResponseEntity.ok(response);
    }

    /**
     * 查询任务状态接口
     * GET /audio/task/{taskId} (通过 Gateway: /api/audio/task/{taskId})
     *
     * @param taskId 任务ID
     * @return 任务状态信息
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<TaskStatusResponse> getTaskStatus(@PathVariable Long taskId) {
        MediaTask task = audioAiService.getTaskById(taskId);

        TaskStatusResponse response = new TaskStatusResponse();
        response.setTaskId(task.getId());
        response.setProgress(task.getProgress());
        response.setErrorMsg(task.getErrorMsg());

        // 转换状态
        String statusStr = convertStatusToString(task.getStatus());
        response.setStatus(statusStr);

        // 解析 taskParams 获取结果 URL
        try {
            if (task.getTaskParams() != null && !task.getTaskParams().isEmpty()) {
                Map<String, Object> taskParams = objectMapper.readValue(
                    task.getTaskParams(),
                    Map.class
                );

                // 人声分离结果
                Object vocalUrl = taskParams.get("vocalUrl");
                Object instUrl = taskParams.get("instUrl");
                if (vocalUrl != null) {
                    response.setVocalUrl(vocalUrl.toString());
                }
                if (instUrl != null) {
                    response.setInstUrl(instUrl.toString());
                }

                // 多轨分离结果
                Object trackUrls = taskParams.get("trackUrls");
                if (trackUrls instanceof List) {
                    response.setTrackUrls((List<String>) trackUrls);
                }
            }
        } catch (Exception e) {
            // 解析失败不影响主要功能，只记录日志
            // log.warn("Failed to parse taskParams: taskId={}", taskId, e);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 内部进度更新接口（供 Python 调用）
     * 通过 Gateway: POST /internal/audio/task/{taskId}/progress
     * Gateway 会 StripPrefix=1，实际路径是: POST /audio/task/{taskId}/progress
     *
     * @param taskId 任务ID
     * @param request 进度更新请求
     * @return 更新结果
     */
    @PostMapping("/task/{taskId}/progress")
    public ResponseEntity<Map<String, Object>> updateTaskProgress(
            @PathVariable Long taskId,
            @RequestBody ProgressUpdateRequest request
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. 查询任务
            MediaTask task = audioAiService.getTaskById(taskId);

            // 2. 如果任务已经是终态（SUCCESS 或 FAILED），直接返回成功，不更新
            if (task.getStatus() == AudioAiService.STATUS_SUCCESS ||
                task.getStatus() == AudioAiService.STATUS_FAILED) {
                response.put("code", 0);
                response.put("message", "Task already in final state, skip update");
                return ResponseEntity.ok(response);
            }

            // 3. 将任务状态设为 PROCESSING（如果当前不是）
            if (task.getStatus() != AudioAiService.STATUS_PROCESSING) {
                task.setStatus(AudioAiService.STATUS_PROCESSING);
            }

            // 4. 只允许"进度前进不后退"
            Integer currentProgress = task.getProgress() == null ? 0 : task.getProgress();
            Integer newProgress = Math.max(currentProgress, request.getProgress());

            // 5. 更新进度并保存
            task.setProgress(newProgress);
            audioAiService.saveTask(task);

            log.debug("Task progress updated: taskId={}, oldProgress={}, newProgress={}, message={}",
                    taskId, currentProgress, newProgress, request.getMessage());

            response.put("code", 0);
            response.put("message", "success");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.warn("Failed to update task progress: taskId={}, error={}", taskId, e.getMessage());
            // 任务不存在或其他错误，返回 200 + no-op（按项目风格处理）
            response.put("code", 0);
            response.put("message", "Task not found or update failed");
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 将状态码转换为字符串
     */
    private String convertStatusToString(Integer status) {
        if (status == null) {
            return "PENDING";
        }
        return switch (status) {
            case 0 -> "PENDING";
            case 1 -> "PROCESSING";
            case 2 -> "SUCCESS";
            case 3 -> "FAILED";
            default -> "UNKNOWN";
        };
    }
}
