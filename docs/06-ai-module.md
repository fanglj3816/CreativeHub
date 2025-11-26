# 06 - AI Module Design

## 音频相关
- 音频分离：使用 Demucs / Spleeter 等模型，将人声和伴奏分离
- 人声克隆：基于 RVC 等模型，生成“自己的声音唱歌”的音频

## 图像相关
- AI 修图：GFPGAN / Real-ESRGAN 等模型
- 风格迁移 / 调色：Stable Diffusion + ControlNet 等

## 服务形式
- 独立 Python 服务（FastAPI）
- 接收来自 media-service 或 user-post-service 的任务
- 处理完成后将结果写回 MinIO / DB

