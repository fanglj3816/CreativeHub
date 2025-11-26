#!/bin/bash
set -e

echo "=== Updating CreativeHub Documentation ==="

########################################
# Create directory structure
########################################

mkdir -p docs
mkdir -p docs/04-service-specifications
mkdir -p docs/06-api-design

########################################
# 01 - Introduction
########################################

cat > docs/01-introduction.md << 'EOF'
# 01 - Introduction

## 1. 项目名称
**CreativeHub（创意分享与 AI 创作平台）**

## 2. 项目简介
CreativeHub 是一个结合社区内容分享、多媒体处理、AI 创作的综合平台。

支持：
- 图文 / 摄影作品 / 攻略分享（类似小红书/小黑盒）
- 媒体上传（图片 / 视频 / 音频）
- 媒体自动处理（压缩、截图、转码、提取封面）
- AI 功能：
  - 音频分离（人声/伴奏）
  - AI 人声模仿（RVC）
  - AI 修图、增强、调色
  - 图片 + 音乐自动合成短视频

目标是打造一个 **内容 + 创作 + AI** 一体化的社区生态。

---

## 3. 项目目标
- 提供 **高质量内容创作工具链**
- 实现 **多媒体 + AI 全链路打通**
- 采用 **可写进简历的微服务架构**
- 适合 **高扩展性、学习、展示** 的后端项目

---

## 4. 技术栈概览

### 后端（微服务）
- Java 17  
- Spring Boot 3.2.x  
- Spring Cloud 2023.x  
- Spring Cloud Alibaba 2023.0.1.0  
- OpenFeign  
- Gateway  
- Nacos  
- Sentinel  
- Kafka（或 RocketMQ）  
- MySQL / PostgreSQL  

### AI 服务
- Python 3.10+
- FastAPI
- Demucs（音频分离）
- RVC（人声克隆）
- GFPGAN / Real-ESRGAN（修图）
- FFmpeg（媒体处理）

### 基础设施
- Redis Cache  
- MinIO 对象存储  
- Elasticsearch（可选，用于搜索）  

---

## 5. 用户角色
- 普通用户  
- 创作者  
- 管理员  

---

## 6. 名词定义
- **媒体（Media）**：图片、视频、音频文件  
- **AI 任务（AI Task）**：Python AI 服务执行的任务  
- **Feed 流（Feed Stream）**：按时间或热度排序的帖子流  
EOF

########################################
# 02 - Requirements
########################################

cat > docs/02-requirements.md << 'EOF'
# 02 - Requirements

## 功能需求（Functional Requirements）

### 1.1 用户系统
- 用户注册 / 登录（邮箱/手机）
- 用户资料：头像、昵称、简介、兴趣
- 关注 / 取关 / 粉丝列表
- 权限系统（用户、管理员）

### 1.2 内容系统（帖子）
- 发布文本内容
- 发布图文帖子
- 发布视频内容
- 发布攻略（长文）
- 点赞 / 收藏 / 评论
- Feed 流（按时间 / 热度排序）

### 1.3 媒体处理
- 图片压缩、缩略图生成
- 视频转码 / 截图 / 封面提取
- 音频波形提取
- 异步处理任务（通过 Kafka）

### 1.4 AI 模块
- 音频分离（人声/伴奏）
- AI 人声音色模仿
- AI 修图 / 增强
- 自动生成短视频（图片 + 音频）

---

## 2. 非功能需求（Non-functional Requirements）
- 高并发可扩展（媒体上传）
- 高性能（缓存 + MQ）
- 可用性（网关 + 熔断）
- 可维护性（模块划分清晰）
- 可观测性（日志、链路追踪）
EOF

########################################
# 03 - System Architecture
########################################

cat > docs/03-system-architecture.md << 'EOF'
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
EOF

########################################
# 04 - Service Specifications
########################################

cat > docs/04-service-specifications/auth-service.md << 'EOF'
# Auth Service Specification

## 功能
- 用户登录
- 用户注册
- Token 签发、刷新
- Token 黑名单

## 需要调用的外部服务
- user-post-service（注册/登录时查询用户）

## API 概述
- POST /auth/register
- POST /auth/login
- POST /auth/token/refresh
EOF

cat > docs/04-service-specifications/user-post-service.md << 'EOF'
# User Post Service Specification

## 功能
- 用户资料
- 帖子系统（图文/视频）
- 评论/回复
- 点赞/收藏
- 关注系统（粉丝/关注）

## 子系统
- User Module
- Post Module
- Comment Module
- Interaction Module
EOF

cat > docs/04-service-specifications/media-service.md << 'EOF'
# Media Service Specification

## 功能
- 图片/视频/音频上传
- 分片上传 / 秒传
- 图片压缩 / 缩略图
- 视频转码 / 截图
- 音频波形提取
- 异步任务（Kafka）
EOF

cat > docs/04-service-specifications/ai-service.md << 'EOF'
# AI Service Specification (Python)

## 功能
- 音频分离
- 人声克隆（RVC）
- AI 修图 / 增强
- 调用 FFmpeg 进行媒体处理

## 路由示例
- POST /audio/separate
- POST /voice/clone
- POST /image/enhance
EOF

########################################
# 05 - Database Design
########################################

cat > docs/05-database-design.md << 'EOF'
# Database Design

## ER 图（ASCII 简化）

```
User --< Post --< Comment
  |        |
  |        ---> MediaFile
  |
  ---> Follow
```

## 核心表
- user
- user_profile
- post
- post_content
- comment
- like_record
- favorite
- follow
- media_file
- media_task
EOF

########################################
# 06 - API Design
########################################

cat > docs/06-api-design/auth-api.md << 'EOF'
# Auth API

## POST /auth/register
参数：
- email
- password

## POST /auth/login
参数：
- email
- password

返回：
- access_token
- refresh_token
EOF

cat > docs/06-api-design/user-api.md << 'EOF'
# User API
## GET /user/profile
## PUT /user/profile/update
EOF

cat > docs/06-api-design/post-api.md << 'EOF'
# Post API

## POST /post/create
## GET /post/detail/:id
## POST /post/like
## POST /post/comment
EOF

cat > docs/06-api-design/media-api.md << 'EOF'
# Media API

## POST /media/upload
## GET /media/:id
EOF

cat > docs/06-api-design/ai-api.md << 'EOF'
# AI API

## POST /ai/audio/separate
## POST /ai/audio/clone
## POST /ai/image/enhance
EOF

########################################
# 07 - MQ Events
########################################

cat > docs/07-message-queue-events.md << 'EOF'
# MQ Events

## media.file.process
媒体处理任务，包括：
- 视频转码
- 图片压缩
- AI 音频分离
EOF

########################################
# 08 - AI Module Design
########################################

cat > docs/08-ai-module-design.md << 'EOF'
# AI Module Design

## 1. 音频分离
模型：Demucs

## 2. 人声克隆
模型：RVC（Retrieval-based Voice Conversion）

## 3. 修图/增强
模型：GFPGAN + Real-ESRGAN
EOF

########################################
# 09 - Media Pipeline
########################################

cat > docs/09-media-pipeline.md << 'EOF'
# Media Processing Pipeline

## 上传流程
前端 → Gateway → media-service → MinIO

## 异步处理
media-service → Kafka → ai-service → MinIO → media-service 更新状态
EOF

########################################
# 11 - Dev Plan
########################################

cat > docs/11-development-plan.md << 'EOF'
# Development Plan

## 阶段 1：基础架构
- 初始化项目
- 部署 Nacos / MySQL / Redis / MinIO

## 阶段 2：用户系统
- auth-service 完成
- user-post-service（用户模块）完成

## 阶段 3：媒体系统
- 上传流程 + MinIO + Kafka
- 视频/图片处理

## 阶段 4：AI 模块
- Python AI 服务
- Java AI 客户端
EOF

echo "=== All documentation updated successfully! ==="