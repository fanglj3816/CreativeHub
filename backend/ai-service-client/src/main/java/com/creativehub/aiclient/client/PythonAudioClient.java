package com.creativehub.aiclient.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Python 音频分离服务客户端
 * 负责调用 Python FastAPI 服务进行音频分离
 */
@Component
public class PythonAudioClient {

    private static final Logger log = LoggerFactory.getLogger(PythonAudioClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String pythonServiceBaseUrl;

    public PythonAudioClient(
        RestTemplate restTemplate,
        ObjectMapper objectMapper,
        @Value("${ai.service.base-url:http://localhost:8001}") String pythonServiceBaseUrl
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.pythonServiceBaseUrl = pythonServiceBaseUrl;
    }

    /**
     * Python 请求体（对应 SeparationRequest）
     */
    public static class SeparationRequest {
        private Integer taskId;
        private String fileUrl;
        private String fileName;

        public SeparationRequest(Integer taskId, String fileUrl, String fileName) {
            this.taskId = taskId;
            this.fileUrl = fileUrl;
            this.fileName = fileName;
        }

        public Integer getTaskId() {
            return taskId;
        }

        public void setTaskId(Integer taskId) {
            this.taskId = taskId;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }
    }

    /**
     * Python 响应体（对应 SeparationResponse）
     */
    public static class SeparationResponse {
        private Integer taskId;
        private String jobId;
        private List<StemResult> results;
        private String vocalUrl;
        private String instUrl;

        public Integer getTaskId() {
            return taskId;
        }

        public void setTaskId(Integer taskId) {
            this.taskId = taskId;
        }

        public String getJobId() {
            return jobId;
        }

        public void setJobId(String jobId) {
            this.jobId = jobId;
        }

        public List<StemResult> getResults() {
            return results;
        }

        public void setResults(List<StemResult> results) {
            this.results = results;
        }

        public String getVocalUrl() {
            return vocalUrl;
        }

        public void setVocalUrl(String vocalUrl) {
            this.vocalUrl = vocalUrl;
        }

        public String getInstUrl() {
            return instUrl;
        }

        public void setInstUrl(String instUrl) {
            this.instUrl = instUrl;
        }
    }

    /**
     * Stem 结果（对应 StemResult）
     */
    public static class StemResult {
        private String stem;
        private String url;

        public String getStem() {
            return stem;
        }

        public void setStem(String stem) {
            this.stem = stem;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    /**
     * 人声分离结果（兼容旧接口）
     */
    public static class VocalSeparationResult {
        private String vocalUrl;
        private String instrumentalUrl;

        public VocalSeparationResult(String vocalUrl, String instrumentalUrl) {
            this.vocalUrl = vocalUrl;
            this.instrumentalUrl = instrumentalUrl;
        }

        public String getVocalUrl() {
            return vocalUrl;
        }

        public String getInstrumentalUrl() {
            return instrumentalUrl;
        }
    }

    /**
     * 多轨分离结果（兼容旧接口）
     */
    public static class StemSeparationResult {
        private List<String> trackUrls = new ArrayList<>();

        public StemSeparationResult(List<String> trackUrls) {
            this.trackUrls = trackUrls;
        }

        public List<String> getTrackUrls() {
            return trackUrls;
        }
    }

    /**
     * 执行人声分离
     *
     * @param taskId Java 任务ID
     * @param audioUrl 音频文件的 MinIO URL
     * @param fileName 文件名（可选）
     * @return 分离结果（人声和伴奏 URL）
     */
    public VocalSeparationResult separateVocal(Long taskId, String audioUrl, String fileName) {
        log.info("Calling Python service for vocal separation: taskId={}, url={}", taskId, audioUrl);
        
        try {
            // 1. 构建请求体
            SeparationRequest request = new SeparationRequest(
                taskId != null ? taskId.intValue() : null,
                audioUrl,
                fileName
            );
            
            // 2. 调用 Python 接口
            String url = pythonServiceBaseUrl + "/internal/separation/vocal";
            SeparationResponse response = callPythonService(url, request);
            
            // 3. 转换响应
            return new VocalSeparationResult(
                response.getVocalUrl(),
                response.getInstUrl()
            );
        } catch (Exception e) {
            log.error("Failed to call Python vocal separation service: taskId={}, url={}", taskId, audioUrl, e);
            throw new RuntimeException("调用 Python 人声分离服务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 执行 4 轨分离
     *
     * @param taskId Java 任务ID
     * @param audioUrl 音频文件的 MinIO URL
     * @param fileName 文件名（可选）
     * @return 分离结果（各轨 URL 列表）
     */
    public StemSeparationResult separateStem4(Long taskId, String audioUrl, String fileName) {
        log.info("Calling Python service for 4-track separation: taskId={}, url={}", taskId, audioUrl);
        
        try {
            SeparationRequest request = new SeparationRequest(
                taskId != null ? taskId.intValue() : null,
                audioUrl,
                fileName
            );
            
            String url = pythonServiceBaseUrl + "/internal/separation/demucs4";
            SeparationResponse response = callPythonService(url, request);
            
            // 提取所有轨道的 URL
            List<String> trackUrls = new ArrayList<>();
            if (response.getResults() != null) {
                for (StemResult result : response.getResults()) {
                    trackUrls.add(result.getUrl());
                }
            }
            
            return new StemSeparationResult(trackUrls);
        } catch (Exception e) {
            log.error("Failed to call Python 4-track separation service: taskId={}, url={}", taskId, audioUrl, e);
            throw new RuntimeException("调用 Python 4轨分离服务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 执行 6 轨分离
     *
     * @param taskId Java 任务ID
     * @param audioUrl 音频文件的 MinIO URL
     * @param fileName 文件名（可选）
     * @return 分离结果（各轨 URL 列表）
     */
    public StemSeparationResult separateStem6(Long taskId, String audioUrl, String fileName) {
        log.info("Calling Python service for 6-track separation: taskId={}, url={}", taskId, audioUrl);
        
        try {
            SeparationRequest request = new SeparationRequest(
                taskId != null ? taskId.intValue() : null,
                audioUrl,
                fileName
            );
            
            String url = pythonServiceBaseUrl + "/internal/separation/demucs6";
            SeparationResponse response = callPythonService(url, request);
            
            // 提取所有轨道的 URL
            List<String> trackUrls = new ArrayList<>();
            if (response.getResults() != null) {
                for (StemResult result : response.getResults()) {
                    trackUrls.add(result.getUrl());
                }
            }
            
            return new StemSeparationResult(trackUrls);
        } catch (Exception e) {
            log.error("Failed to call Python 6-track separation service: taskId={}, url={}", taskId, audioUrl, e);
            throw new RuntimeException("调用 Python 6轨分离服务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 调用 Python 服务的通用方法
     */
    private SeparationResponse callPythonService(String url, SeparationRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<SeparationRequest> requestEntity = new HttpEntity<>(request, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // 解析 JSON 响应
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                SeparationResponse separationResponse = new SeparationResponse();
                
                if (jsonNode.has("taskId") && !jsonNode.get("taskId").isNull()) {
                    separationResponse.setTaskId(jsonNode.get("taskId").asInt());
                }
                if (jsonNode.has("jobId")) {
                    separationResponse.setJobId(jsonNode.get("jobId").asText());
                }
                if (jsonNode.has("vocalUrl") && !jsonNode.get("vocalUrl").isNull()) {
                    separationResponse.setVocalUrl(jsonNode.get("vocalUrl").asText());
                }
                if (jsonNode.has("instUrl") && !jsonNode.get("instUrl").isNull()) {
                    separationResponse.setInstUrl(jsonNode.get("instUrl").asText());
                }
                
                // 解析 results 数组
                if (jsonNode.has("results") && jsonNode.get("results").isArray()) {
                    List<StemResult> results = new ArrayList<>();
                    for (JsonNode resultNode : jsonNode.get("results")) {
                        StemResult stemResult = new StemResult();
                        if (resultNode.has("stem")) {
                            stemResult.setStem(resultNode.get("stem").asText());
                        }
                        if (resultNode.has("url")) {
                            stemResult.setUrl(resultNode.get("url").asText());
                        }
                        results.add(stemResult);
                    }
                    separationResponse.setResults(results);
                }
                
                log.info("Python service response: taskId={}, jobId={}, resultsCount={}", 
                    separationResponse.getTaskId(), 
                    separationResponse.getJobId(),
                    separationResponse.getResults() != null ? separationResponse.getResults().size() : 0);
                
                return separationResponse;
            } else {
                throw new RuntimeException("Python service returned non-2xx status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to call Python service: url={}", url, e);
            throw new RuntimeException("调用 Python 服务失败: " + e.getMessage(), e);
        }
    }
}
