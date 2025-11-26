# 05 - Media Processing Pipeline

媒体处理流程说明：

1. 用户在前端发起上传（图片 / 视频 / 音频）
2. 通过 gateway 进入 media-service
3. media-service 负责：
   - 分片上传 / 秒传
   - 将原始文件存储到 MinIO
   - 写入 media_file 元数据
   - 发送处理任务到 MQ（例如：转码、截图、波形提取）
4. 异步消费者 / AI 服务处理完成后：
   - 更新 media_task 状态
   - 更新 media_file 信息
   - 将可用的访问 URL 返回给业务服务（如 user-post-service）

后续会在此文档中详细画出时序图与状态机。
