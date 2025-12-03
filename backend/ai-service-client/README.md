# AI Service Client 模块

## 概述

本模块提供了调用 Python 音频 AI 服务（FastAPI + Demucs + UVR）的 Java 客户端。

## 功能

- **人声/伴奏分离**：调用 `POST /separate/vocal` 接口
- **4 轨分离（Demucs）**：调用 `POST /separate/demucs4` 接口
- **6 轨分离（Demucs）**：调用 `POST /separate/demucs6` 接口

## 模块结构

```
com.creativehub.ai
├── client/                    # HTTP 客户端层
│   ├── AudioAiClient.java    # AI 服务 HTTP 客户端
│   ├── config/                # 配置类
│   │   ├── AudioAiServiceProperties.java  # 配置属性类
│   │   └── RestClientConfig.java          # RestTemplate 配置
│   ├── exception/             # 异常类
│   │   └── AudioServiceCallException.java
│   └── util/                  # 工具类
│       └── MultipartInputStreamFileResource.java
├── service/                   # 业务服务层
│   └── AudioAiService.java    # AI 音频处理业务服务
├── controller/                # 控制器层（示例）
│   └── AudioAiController.java
└── example/                   # 使用示例
    └── AudioAiServiceUsageExample.java
```

## 配置

在 `application.yml` 中配置 AI 服务的基础 URL：

```yaml
ai:
  service:
    base-url: http://localhost:8001
```

## 使用方式

### 1. 在业务 Service 中注入 AudioAiService

```java
@Service
public class YourService {
    private final AudioAiService audioAiService;
    
    public YourService(AudioAiService audioAiService) {
        this.audioAiService = audioAiService;
    }
    
    public String processAudio(MultipartFile file) {
        return audioAiService.vocalSeparate(file);
    }
}
```

### 2. 在 Controller 中使用

```java
@RestController
@RequestMapping("/api/audio")
public class YourController {
    private final AudioAiService audioAiService;
    
    @PostMapping("/vocal")
    public ResponseEntity<String> vocalSeparate(@RequestPart("file") MultipartFile file) {
        String result = audioAiService.vocalSeparate(file);
        return ResponseEntity.ok(result);
    }
}
```

## API 接口

### AudioAiService

- `vocalSeparate(MultipartFile file)` - 人声/伴奏分离
- `demucs4Separate(MultipartFile file)` - 4 轨分离
- `demucs6Separate(MultipartFile file)` - 6 轨分离

所有方法返回 Python 服务返回的 JSON 字符串。

## 异常处理

当调用失败时，会抛出 `AudioServiceCallException`：

```java
try {
    String result = audioAiService.vocalSeparate(file);
} catch (AudioServiceCallException e) {
    // 处理调用失败
}
```

## 依赖

- `spring-boot-starter-web` - 已包含在 pom.xml 中

## 详细使用示例

请参考 `USAGE_EXAMPLE.md` 文件。




