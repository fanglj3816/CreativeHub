# CreativeHub 项目总览

> 版本：v0.2  
> 目的：让任何人 / 新对话 / Cursor 在 1 分钟内搞清楚这个项目是干什么的、目前做到哪了、下一步做什么。

## 1. 项目简介

CreativeHub 是一个融合音乐创作、摄影作品、AI 工具的创作社区平台，目标形态类似：

- 内容社区：小红书 / 小黑盒（动态、攻略、作品分享）
- 多媒体平台：支持图片 / 视频 / 音频等多种作品形式
- AI 创作工具箱：音频分离、人声模仿、图像修复与调色、图像生成短视频等

项目定位：

- 既是个人技术练手 & 简历项目，也是可以长期迭代的“真项目”
- 后端采用 Spring Cloud 微服务 + Nacos + Gateway + MySQL + MinIO
- 前端采用 React + Vite + Ant Design，深色极简 + 创作氛围的 UI
- 媒体与 AI 相关能力独立成服务，方便扩展

---

## 2. 技术栈总览

### 2.1 前端

- 框架：React + TypeScript + Vite
- UI：Ant Design
- 样式：
  - 深色主题、渐变卡片、大圆角
  - 音符 / 相机 / 创作氛围的 icon
- 主要页面（当前）：
  - 登录 / 注册页（已完成）
  - 主布局页面：左侧导航 + 中间 Feed + 右侧快捷入口（已完成初版）
  - 发布作品页：支持文本 + 图片 / 视频 / 音频上传（已完成初版）
  - 首页 Feed：静态假数据 + 准备接入真实帖子数据（进行中）

### 2.2 后端 & 基础设施

- Java 17 + Spring Boot 3
- Spring Cloud Alibaba
  - Nacos：注册中心 & 配置中心
  - Spring Cloud Gateway：统一网关
- 数据库：MySQL
- 对象存储：MinIO（本地 Docker 部署）
- 预留：Kafka 用于媒体异步处理、AI 任务
- 其他：Lombok、MapStruct、Spring Security / JWT

---

## 3. 微服务与模块概览

> 更细节见《02_SYSTEM_DESIGN.md》

### 3.1 gateway-service

- 使用 Spring Cloud Gateway
- 从 Nacos 获取各服务地址
- 职责：
  - 统一入口路由
  - 统一 CORS（目前已在这里集中配置）
  - 未来：JWT 鉴权前移、限流、统一日志

### 3.2 auth-service / user-service

- 提供用户注册 / 登录 / 基础信息接口
- 使用 MySQL 存储用户账号与资料（账号 / 资料分表）
- 当前能力：
  - 邮箱 + 密码注册 / 登录
  - 用户基础信息查询（昵称、头像）

### 3.3 user-post-service（内容系统）

- 核心：帖子（post）+ 媒体关联（post_media）
- 当前能力：
  - 创建帖子：文本 + 多媒体（图片 / 视频 / 音频），接收 mediaIds
  - 查询帖子详情：GET /posts/{id}
  - 获取帖子 Feed：GET /posts?page=&pageSize=
- 未来扩展：
  - 点赞 / 收藏 / 评论 / 关注
  - 标签 / 话题 / 推荐算法

### 3.4 media-service（媒体系统）

- 职责：
  - 媒体上传（图片 / 视频 / 音频）
  - 存储到 MinIO，并记录到 media_file
  - 文件 MD5 去重（相同文件只存一次）
  - 对外提供媒体查询接口
- 未来扩展：
  - 媒体异步转码、缩略图 / 封面 / 波形生成
  - 与 AI 服务对接

### 3.5 ai-service & ai-service-client（规划中）

- ai-service（Python）：音频分离、AI 人声、图像增强、视频生成等
- ai-service-client（Java）：封装调用 Python 的 HTTP / gRPC 客户端

### 3.6 frontend

- React/Vite 项目，与上述后端通过 Gateway 通讯
- 已对接：
  - 登录 / 注册 API
  - 媒体上传 API
  - 创建帖子 API

---

## 4. 当前已实现的主要功能（v0.2）

> 详细任务见《04_DEV_PROGRESS.md》

- MySQL & Docker 基础环境搭建
- MinIO 本地部署，媒体持久化目录配置
- Nacos 注册中心搭建，服务注册正常
- Gateway 基本路由 + CORS 配置稳定
- auth-service：
  - 邮箱注册 / 登录
  - 用户基础信息
- media-service：
  - 媒体上传接口
  - MinIO 存储集成
  - media_file 表设计
  - 文件内容 MD5 去重
- user-post-service：
  - post + post_media 表
  - 创建帖子接口
  - 详情 / Feed 接口，PostDTO 组装
- 前端：
  - 登录 / 注册 UI 与联调
  - 主布局 & 静态 Feed 卡片
  - 发布作品页：文本 + 图片 / 视频 / 音频上传与预览
  - 调用 /media/upload 与 /posts

---

## 5. 正在进行与下一阶段目标

正在推进的部分（详见《04_DEV_PROGRESS.md》）：

- 首页 Feed 接入真实数据（真实帖子 + 静态假数据混合展示）
- 搜索帖子功能（关键字检索）
- 帖子详情页（点击 Feed 进入）
- 统一的 AudioPlayer 组件（动态波形 + 名称 + 时长显示）

中期目标：

- 点赞 / 评论 / 收藏 / 关注
- 创作者主页
- 媒体异步处理（封面、缩略图、波形等）
- 初版 AI 工具：音频分离 + 简单图像修复

长期目标：

- 完整 AI 创作工作流（上传 → AI 处理 → 生成新媒体 → 发帖绑定）
- 多维推荐 / 标签体系
- 对外 API / SDK

---

## 6. 新对话使用说明（给 ChatGPT / Cursor）

- 想快速了解项目：先读本文件
- 需要架构 / 表结构 / 流程：看《02_SYSTEM_DESIGN.md》
- 需要接口详情：看《03_API_REFERENCE.md》
- 想继续开发：优先阅读《04_DEV_PROGRESS.md》的 In Progress 与 Next 部分
