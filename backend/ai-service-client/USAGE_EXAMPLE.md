# AudioAiService 使用示例

## 配置说明

在使用 `AudioAiService` 之前，需要在 `application.yml` 中配置 AI 服务的基础 URL：

```yaml
ai:
  service:
    base-url: http://localhost:8001
```

## 在业务模块中使用

### 1. 注入 AudioAiService

```java
package com.creativehub.yourservice.service;

import com.creativehub.ai.service.AudioAiService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class YourBusinessService {
    
    private final AudioAiService audioAiService;
    
    public YourBusinessService(AudioAiService audioAiService) {
        this.audioAiService = audioAiService;
    }
    
    /**
     * 示例：调用人声分离服务
     */
    public String processVocalSeparation(MultipartFile audioFile) {
        try {
            // 调用人声分离接口
            String result = audioAiService.vocalSeparate(audioFile);
            
            // result 是 Python 服务返回的 JSON 字符串
            // 例如：{"vocal": "path/to/vocal.wav", "instrumental": "path/to/instrumental.wav"}
            
            return result;
        } catch (com.creativehub.ai.client.exception.AudioServiceCallException e) {
            // 处理调用失败的情况
            throw new RuntimeException("AI 服务调用失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 示例：调用 4 轨分离服务
     */
    public String processDemucs4(MultipartFile audioFile) {
        String result = audioAiService.demucs4Separate(audioFile);
        return result;
    }
    
    /**
     * 示例：调用 6 轨分离服务
     */
    public String processDemucs6(MultipartFile audioFile) {
        String result = audioAiService.demucs6Separate(audioFile);
        return result;
    }
}
```

### 2. 在 Controller 中使用

```java
package com.creativehub.yourservice.controller;

import com.creativehub.ai.service.AudioAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/your-service")
public class YourController {
    
    private final AudioAiService audioAiService;
    
    public YourController(AudioAiService audioAiService) {
        this.audioAiService = audioAiService;
    }
    
    @PostMapping("/vocal-separate")
    public ResponseEntity<String> vocalSeparate(@RequestPart("file") MultipartFile file) {
        String result = audioAiService.vocalSeparate(file);
        return ResponseEntity.ok(result);
    }
}
```

### 3. 处理返回结果

Python 服务返回的是 JSON 字符串，可以使用 Jackson 或 Gson 解析：

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

// 解析 JSON 结果
ObjectMapper objectMapper = new ObjectMapper();
Map<String, String> resultMap = objectMapper.readValue(result, Map.class);

String vocalPath = resultMap.get("vocal");
String instrumentalPath = resultMap.get("instrumental");
```

## 异常处理

当调用 AI 服务失败时，会抛出 `AudioServiceCallException`：

```java
try {
    String result = audioAiService.vocalSeparate(file);
    // 处理成功结果
} catch (AudioServiceCallException e) {
    // 处理调用失败
    log.error("AI 服务调用失败", e);
    // 返回错误响应或抛出业务异常
}
```

## 注意事项

1. 确保 Python AI 服务运行在配置的 URL 上（默认 http://localhost:8001）
2. 确保网络连接正常
3. 文件大小限制：注意 Spring Boot 的 `spring.servlet.multipart.max-file-size` 配置
4. 超时设置：如果需要，可以在 `RestClientConfig` 中配置 RestTemplate 的超时时间




