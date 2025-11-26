# 03 - System Architecture

CreativeHub 采用 **Spring Cloud Alibaba + Python AI Service** 的混合微服务架构。

---

## 1. 微服务划分

```
gateway-service
auth-service
user-post-service
media-service
ai-service-client (Java SDK / 封装 Python 调用)
ai-service (Python)
common (公共模块)
```

---

## 2. 架构总览（ASCII Architecture Diagram）

```
                         +------------------+
                         |  Gateway API     |
                         +--------+---------+
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
+---------v---------+   +---------v---------+   +---------v---------+
|  auth-service     |   | user-post-service |   |  media-service    |
| 登录注册 / Token   |   | 用户/帖子/评论等    |   | 媒体上传/处理       |
+---------+---------+   +---------+---------+   +---------+---------+
          |                       |                       |
          |                       |                       |
          |                       |                       |
          |         +-------------+-------------+         |
          |         |                           |         |
          |         |  ai-service-client (Java) |         |
          |         |  封装调用 Python AI 服务    |         |
          |         +-------------+-------------+         |
          |                       |                       |
          |                       |                       |
          +-----------------------+-----------------------+
                                  |
                          HTTP / gRPC 调用
                                  |
                     +------------v-------------+
                     |      ai-service (Py)     |
                     | 音频分离/AI修图/人声克隆 |
                     +---------------------------+
```

---

## 3. 核心流程：用户发帖流程（含媒体）

```
前端 → Gateway → user-post-service → media-service
        ↑               ↓
        ----------------→ Kafka (任务)
                          ↓
                     ai-service
                          ↓
                     media-service 更新状态
                          ↓
                     user-post-service 绑定资源
```

---

## 4. 核心流程：音频分离

```
前端上传音频
→ media-service 写入 MinIO
→ 生成任务发送 Kafka
→ ai-service 拉取任务处理
→ 输出结果上传 MinIO
→ media-service 更新 media_file
→ 前端轮询/回调 查看结果
```
