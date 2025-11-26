# CreativeHub 项目总览

> 版本：v0.1（项目初始化阶段总结）

---

## 1. 项目背景 & 初衷

作者个人兴趣：**音乐、唱歌、乐器、游戏、摄影、编曲** 等，希望做一个既能练手后端技术、又能长期迭代、有“作品感”的 Web 应用。

目标是实现一个类似 **小红书 + 小黑盒 + AI 创作工具箱** 的网站：

- 有 **社区内容分享 / 攻略 / 摄影作品 / 游戏心得** 等模块
- 有 **媒体上传 & 处理**（图片、视频、音频）
- 有 **AI 音乐 / 图像 / 视频** 相关功能，用来玩音频分离、人声模仿、修图、调色等
- 同时满足：**技术学习 + 项目展示 + 可持续扩展**

约束 & 风险意识：

- 音乐相关功能要 **避免侵权**（不提供盗版伴奏库，不鼓励上传受版权保护的完整音源）
- AI 模型主要作为“工具”，不直接提供版权有风险的成品

---

## 2. 核心功能规划

### 2.1 用户 & 社区

- 用户注册 / 登录（邮箱起步，后续可扩展手机）
- 用户资料：头像、昵称、简介、兴趣标签等
- 用户关注 / 粉丝
- 内容类型：
  - 图文帖子（攻略、生活分享、摄影作品、游戏心得）
  - 视频帖子（游戏剪辑、vlog 等）
- 互动系统：
  - 点赞、收藏、评论、回复
  - 按时间 / 热度的 Feed 流
- 搜索与筛选（后续可接 ES）

### 2.2 媒体处理

- 图片：
  - 上传、压缩、生成缩略图
  - 存储到对象存储（MinIO）
- 视频：
  - 上传、转码（统一清晰度 / 格式）
  - 截图生成封面
- 音频：
  - 上传、波形分析（可视化用）
- 所有媒体的 **异步处理** 通过 MQ（Kafka）调度

### 2.3 AI 功能（第一期规划）

- **音频分离**：从混音中分离人声 / 伴奏（如用 Demucs）
- **AI 人声模仿**：用户上传自己的干声，使用 RVC 之类模型做 timbre transfer
- **AI 修图 / 调色 / 增强**：使用 GFPGAN / Real-ESRGAN 对图像增强
- **图片 + BGM 生成简单视频**：将图片序列 + 音乐合成短视频（FFmpeg）

这些功能由独立的 Python 服务 `ai-service` 提供，Java 侧通过 `ai-service-client` 调用。

### 2.4 管理后台（Admin）

- 用户管理（封禁账号、调整角色）
- 内容管理（删除违规帖、审核内容）
- 媒体管理（媒体列表、重新处理）
- AI 任务管理（任务队列、重试失败任务）
- 后续可以扩展监控面板、报表等

---

## 3. 技术栈 & 基础设施

### 3.1 后端（Java）

- Java 17
- Spring Boot 3.2.x
- Spring Cloud 2023.x
- Spring Cloud Alibaba 2023.0.1.0
- Spring Security + JWT（无状态鉴权）
- Spring Data JPA
- OpenFeign（服务间调用）
- Spring Cloud Gateway

### 3.2 AI 服务（Python）

- Python 3.10+
- FastAPI
- Demucs（音频分离）
- RVC（人声克隆）
- GFPGAN / Real-ESRGAN（图像增强）
- FFmpeg（音视频处理管线）
- 可选：Celery / RQ 等任务队列

### 3.3 基础设施

- Nacos（注册中心 & 配置中心）
- MySQL（起步，后续某些模块可分库）
- Redis（缓存、Session、计数）
- Kafka（媒体处理 & AI 任务异步队列）
- MinIO（对象存储）
- 可选：Elasticsearch（搜索）
- 日志 & 监控：后续可接 Prometheus + Grafana + SkyWalking

---

## 4. 微服务划分 & 目录结构

### 4.1 服务列表（后端 Java）

- `gateway-service`
  - API 网关，统一入口
  - 基于 Nacos 服务发现 + Spring Cloud Gateway
  - 负责路由、限流、简单鉴权（转发 JWT）

- `auth-service`
  - **用户认证中心**
  - 注册 / 登录 / JWT 颁发 / 基础权限控制（后续可扩展到 RBAC）
  - 使用 Spring Security + JWT + JPA
  - 操作用户相关数据库（目前是 `creativehub_user` 库中的账号/资料/地址）

- `user-post-service`
  - 用户资料查询与更新（读写 `user_profile` 等）
  - 帖子 / 评论 / 点赞 / 收藏 / 关注等社区核心逻辑
  - 将来会对接 media-service 的媒体引用

- `media-service`
  - 媒体上传、存储、访问（图片 / 视频 / 音频）
  - 负责对接 MinIO、Kafka
  - 创建媒体处理任务（转码、截图、波形分析等）

- `ai-service-client`
  - Java 侧调用 Python `ai-service` 的封装客户端
  - 封装 HTTP / gRPC 调用、重试、统一请求响应格式
  - 供 `media-service`、`user-post-service` 等复用

- `admin-service`
  - 管理后台相关 API
  - 用户 / 内容 / 媒体 / AI 任务管理
  - 通过 Feign 调用其他服务

- `common`
  - 公共模块，包括：
    - `common-core`：通用工具、基础配置
    - `common-web`：统一异常处理、结果封装
    - `common-security`：安全相关通用逻辑（如 JWT 工具）
    - `common-mq`：MQ 统一封装
    - `common-feign`：Feign 统一配置（拦截器等）

### 4.2 AI 服务（Python）

- 独立仓库或 `ai-service/` 目录
- 通过 REST API（FastAPI）暴露：
  - `/audio/separate`
  - `/voice/clone`
  - `/image/enhance`
  - `/video/generate` 等接口

---

## 5. 核心架构 & 流程（高层）

### 5.1 整体架构（文字描述）

1. 所有前端请求 → `gateway-service`
2. Gateway 根据路由规则和 Nacos 服务发现，将请求转发到对应微服务（auth、user-post、media、admin 等）
3. 每个微服务使用：
   - 自己的数据库/表
   - Nacos 做注册发现
   - Kafka 处理异步任务
4. 和 AI 相关的功能：
   - Java 服务将任务写入 Kafka 或直接调用 `ai-service-client`
   - `ai-service-client` → Python `ai-service`
   - Python 处理结果写回 MinIO 或数据库，再由 Java 更新状态

### 5.2 核心流程示例

**用户注册登录**

- 注册：
  - Gateway → `auth-service` `/auth/register`
  - `auth-service` 写入 `user_account`、`user_profile`，可选写入 `user_address`
- 登录：
  - Gateway → `auth-service` `/auth/login`
  - 校验密码 & 状态 → 签发 JWT → 返回给前端

**图文发帖**

- 前端先调用 `media-service` 上传图片 → 返回 mediaId / URL
- 再调用 `user-post-service` 创建帖子，附带 mediaId 列表
- 展示时：帖子内容 + 媒体 URL

**音频分离（AI）**

- 用户上传音频 → `media-service` → 保存源文件
- `media-service` 发 MQ 消息 `media.audio.separate`
- `ai-service` 消费消息 → 调用模型 → 输出人声 / 伴奏 → 存到 MinIO
- 处理完成后 `media-service` 更新任务状态 & 媒体记录
- 前端轮询 / WebSocket 通知用户结果

---

## 6. 当前进度总结（截至本次对话）

### 6.1 已完成

- GitHub 仓库 `CreativeHub` 已创建
- 基础目录与模块结构已初始化（包括 `backend/` 与 `docs/`）
- 使用脚本批量生成了文档骨架和项目说明
- 确定使用：
  - Spring Cloud 2023 + Spring Cloud Alibaba 2023.0.1.0
  - Nacos 作为注册中心
  - JPA + Spring Security + JWT 作为认证方案
- Nacos 已能正确启动
- `gateway-service` 和 `auth-service` 已成功注册到 Nacos
- Gateway 能通过服务发现路由到 `auth-service`
- `auth-service` 已有一个可通过网关访问的 `/health` 接口
- 新增了 `admin-service` 模块及对应文档占位

### 6.2 正在进行

- 设计 `creativehub_user` 库的**用户相关表结构**：
  - `user_account`
  - `user_profile`
  - `user_address`
- 准备在 `auth-service` 中实现：
  - 注册接口 `/auth/register`（带可选地址）
  - 登录接口 `/auth/login`
  - 基于 Spring Security + JWT 的无状态认证体系

### 6.3 下一步计划（短期）

1. 在 MySQL 中执行用户相关建表 SQL  
2. 在 `auth-service` 中：
   - 配置数据源（连接 `creativehub_user`）
   - 用 JPA 建立实体 / Repository
   - 实现注册 / 登录业务逻辑
   - 配置 Spring Security + JWT 过滤器 & 安全配置
3. 在 Gateway 中加入基础鉴权处理（转发 JWT，白名单 `/auth/**`、`/health`）
4. `user-post-service`：设计用户与帖子表结构（可在下一个阶段实现）

---

## 7. 使用说明：如何在新对话中继续项目

在新的 ChatGPT 对话中，如果模型支持访问你的仓库 / 本地文件，只需要说明：

> “这是我名为 CreativeHub 的项目，请阅读 `docs/CREATIVEHUB_OVERVIEW.md` 和 `docs/CREATIVEHUB_CONTEXT.md`，按照里面的设计继续帮我实现 auth-service 的登录 / 注册逻辑（JPA + Spring Security + JWT）。”

模型读完这两个文件，就能在 **不用老对话上下文** 的情况下，完整理解你的项目现状，并继续开发，而响应速度也会快很多。
