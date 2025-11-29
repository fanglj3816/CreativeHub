# 视频转码功能实现总结

## 一、新增文件

### 1. FFmpegExecutor.java
**路径**: `src/main/java/com/creativehub/media/util/FFmpegExecutor.java`

**功能**:
- 封装 FFmpeg 命令执行
- 执行视频转码（MOV → MP4）
- 支持超时控制（默认 5 分钟）
- 提供 FFmpeg 可用性检查

**主要方法**:
- `transcodeToMp4(String inputFile, String outputFile)`: 执行转码
- `isAvailable()`: 检查 FFmpeg 是否可用

### 2. FFprobeUtil.java
**路径**: `src/main/java/com/creativehub/media/util/FFprobeUtil.java`

**功能**:
- 使用 FFprobe 获取媒体文件元数据
- 解析 JSON 输出，提取宽高、时长
- 支持超时控制（默认 30 秒）

**主要方法**:
- `getMediaMeta(String filePath)`: 获取媒体元数据
- `isAvailable()`: 检查 FFprobe 是否可用

### 3. MediaMeta.java
**路径**: `src/main/java/com/creativehub/media/util/MediaMeta.java`

**功能**:
- DTO 类，存储媒体元数据
- 包含 width, height, durationSec 字段

## 二、修改的文件

### 1. MediaFileServiceImpl.java
**路径**: `src/main/java/com/creativehub/media/service/impl/MediaFileServiceImpl.java`

**主要修改**:
- 添加 FFmpegExecutor 和 FFprobeUtil 依赖注入
- 重写 `uploadMedia` 方法，实现转码流程：
  1. 保存文件到临时目录 (`/tmp/media_upload/`)
  2. 判断是否需要转码（MOV/MKV/AVI 等 → MP4）
  3. 执行转码（如需要）
  4. 获取媒体元数据（宽高、时长）
  5. 上传到 MinIO
  6. 保存到数据库
  7. 清理临时文件
- 新增 `uploadFileToMinio(File file, ...)` 方法，支持 File 对象上传
- 新增 `buildObjectName(String, String)` 方法，支持指定扩展名
- 新增 `generateDisplayName(String)` 方法，生成显示名称
- 新增 `cleanupTempFile(File)` 方法，清理临时文件

**转码逻辑**:
- 支持的视频格式（无需转码）: MP4
- 需要转码的格式: MOV, MKV, AVI, HEVC, FLV, WMV, M4V, 3GP
- 音频格式: 不做转码（FLAC 保持无损）

### 2. MediaFileService.java
**路径**: `src/main/java/com/creativehub/media/service/MediaFileService.java`

**修改**:
- `uploadMedia` 方法返回类型从 `UploadResponse` 改为 `MediaDTO`

### 3. MediaFileController.java
**路径**: `src/main/java/com/creativehub/media/controller/MediaFileController.java`

**修改**:
- `uploadMedia` 方法返回类型从 `ApiResponse<UploadResponse>` 改为 `ApiResponse<MediaDTO>`
- 移除 `UploadResponse` 导入

## 三、转码流程

```
1. 接收 MultipartFile
   ↓
2. 保存到临时目录: /tmp/media_upload/{uuid}.{ext}
   ↓
3. 判断文件类型
   ├─ 视频文件
   │  ├─ MP4 → 直接使用
   │  └─ MOV/MKV/AVI 等 → 转码为 MP4
   ├─ 音频文件 → 直接使用（不转码）
   └─ 图片文件 → 直接使用
   ↓
4. 获取媒体元数据（仅视频）
   - 使用 FFprobe 获取 width, height, duration
   ↓
5. 上传到 MinIO
   - 存储路径: creativehub-media/2025/11/29/{uuid}.mp4
   ↓
6. 保存到数据库
   - 设置所有字段（包括 width, height, duration_sec）
   ↓
7. 清理临时文件
```

## 四、FFmpeg 转码命令

```bash
ffmpeg -i {input} \
  -vcodec libx264 \
  -preset veryfast \
  -acodec aac \
  -strict -2 \
  -movflags +faststart \
  {output}
```

**参数说明**:
- `-vcodec libx264`: H.264 视频编码（浏览器兼容）
- `-preset veryfast`: 快速编码预设
- `-acodec aac`: AAC 音频编码（浏览器兼容）
- `-strict -2`: 允许使用实验性编码器
- `-movflags +faststart`: 将元数据移到文件开头，支持边加载边播放

## 五、数据库字段映射

MediaFile 实体已包含以下字段（无需修改）:
- `id`
- `owner_id`
- `biz_type`
- `file_type` (VIDEO/IMAGE/AUDIO)
- `url`
- `storage_path`
- `size_bytes`
- `duration_sec`
- `width`
- `height`
- `status` (0=正常)
- `original_name`
- `display_name`
- `md5`
- `created_at`
- `updated_at`

## 六、API 返回格式

上传成功后返回 `MediaDTO`:

```json
{
  "id": 123,
  "fileType": "VIDEO",
  "url": "http://localhost:9000/creativehub-media/2025/11/29/abc123.mp4",
  "width": 1920,
  "height": 1080,
  "duration": 120,
  "displayName": "my_video"
}
```

## 七、依赖要求

- Spring Boot 3.2.4（已包含 Jackson，无需额外添加）
- FFmpeg 和 FFprobe（需要系统安装，见 FFMPEG_SETUP.md）

## 八、注意事项

1. **临时目录**: 使用 `/tmp/media_upload/`，确保有写入权限
2. **超时设置**: 转码默认 5 分钟超时，可根据需要调整
3. **错误处理**: 转码失败会抛出 `MediaUploadException`
4. **去重机制**: 基于 MD5 值去重，转码后的文件也会计算 MD5
5. **音频格式**: FLAC 等音频格式不做转码，保持原始格式

## 九、测试建议

1. 上传 MP4 视频（应直接上传，不转码）
2. 上传 MOV 视频（应自动转码为 MP4）
3. 上传 FLAC 音频（应直接上传，不转码）
4. 验证元数据是否正确获取（宽高、时长）
5. 验证 MinIO 存储路径格式
6. 验证数据库记录完整性

