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
