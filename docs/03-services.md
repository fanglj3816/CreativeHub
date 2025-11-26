# 03 - Microservices Design

## 1. gateway-service
- 统一入口
- 路由转发
- JWT 解析
- 限流（配合 Sentinel）

## 2. auth-service
- 登录 / 注册
- JWT 签发与刷新
- Token 黑名单
- 登录时访问 user-post-service 获取用户信息

## 3. user-post-service
- 用户信息 / 角色 / 权限
- 帖子 / 攻略管理
- 评论 / 回复
- 点赞 / 收藏
- 关注 / 粉丝
- 简单 Feed 流（按时间 / 热度）

## 4. media-service
- 媒体上传（分片、秒传）
- 图片压缩、缩略图
- 视频转码、截图
- 音频处理（时长、波形）
- 任务入 MQ，交给 AI 服务处理

## 5. ai-service（Python）
- 音频分离（vocal / bgm）
- AI 模仿人声
- AI 修图 / 调色
- 可扩展更多模型

## 6. common 模块
- 公共工具
- Web 统一返回封装
- 安全 / JWT / 拦截器
- MQ 封装
- Feign 公共配置
