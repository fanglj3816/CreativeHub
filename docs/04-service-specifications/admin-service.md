# Admin Service Specification

## 功能
- 用户管理（封禁、角色调整）
- 内容管理（删除违规内容）
- 媒体管理（审核、重试处理)
- AI 任务管理（重试、失败监控)
- 系统监控（未来可扩展 Prometheus)

## 外部服务调用
- user-post-service
- media-service
- ai-service-client
- auth-service

