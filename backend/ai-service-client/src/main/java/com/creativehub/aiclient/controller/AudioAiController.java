package com.creativehub.aiclient.controller;

import com.creativehub.aiclient.service.AudioAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * AI 音频处理控制器示例
 * 提供 REST API 接口调用 Python AI 服务
 */
@RestController
@RequestMapping("/audio")
public class AudioAiController {

    private final AudioAiService audioAiService;

    public AudioAiController(AudioAiService audioAiService) {
        this.audioAiService = audioAiService;
    }

    /**
     * 人声/伴奏分离接口
     * POST /audio/vocal
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    @PostMapping("/vocal")
    public ResponseEntity<String> vocalSeparate(@RequestPart("file") MultipartFile file) {
        String result = audioAiService.vocalSeparate(file);
        return ResponseEntity.ok(result);
    }

    /**
     * 4 轨分离接口（Demucs）
     * POST /audio/demucs4
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    @PostMapping("/demucs4")
    public ResponseEntity<String> demucs4Separate(@RequestPart("file") MultipartFile file) {
        String result = audioAiService.demucs4Separate(file);
        return ResponseEntity.ok(result);
    }

    /**
     * 6 轨分离接口（Demucs）
     * POST /audio/demucs6
     *
     * @param file 音频文件
     * @return Python 服务返回的 JSON 字符串
     */
    @PostMapping("/demucs6")
    public ResponseEntity<String> demucs6Separate(@RequestPart("file") MultipartFile file) {
        String result = audioAiService.demucs6Separate(file);
        return ResponseEntity.ok(result);
    }
}




