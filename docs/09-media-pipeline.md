# Media Processing Pipeline

## 上传流程
前端 → Gateway → media-service → MinIO

## 异步处理
media-service → Kafka → ai-service → MinIO → media-service 更新状态
