# 02 - System Architecture

本项目采用 Spring Cloud Alibaba 微服务架构，核心服务包括：

1. gateway-service      网关服务
2. auth-service         认证 / 登录 / 注册
3. user-post-service    用户 + 帖子 + 评论 + 点赞收藏关注
4. media-service        媒体上传与处理（图片/音频/视频）
5. ai-service (Python)  AI 模块：音频分离、AI 修图、人声克隆等
6. common               公共依赖模块

后端基础设施：
- Spring Boot 3.2.x
- Spring Cloud 2023.x
- Spring Cloud Alibaba 2023.0.1.0
- Nacos（服务注册 + 配置中心）
- Sentinel（限流 / 熔断）
- MQ（Kafka/RocketMQ，异步任务）
- MinIO（对象存储）
- Elasticsearch（搜索，可选）

