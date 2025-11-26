# CreativeHub 上下文对象说明（领域模型 & 关键设计）

> 用于让新对话快速理解“这个项目在干什么，有哪些对象，设计如何”。

---

## 1. 服务列表与职责（更细节版）

### 1.1 gateway-service

- Spring Cloud Gateway
- 从 Nacos 获取服务列表
- 负责：
  - HTTP 路由：`/auth/**` → auth-service 等
  - 基础日志、traceId 传递
  - 将来可接：
    - 限流（Sentinel / 自定义过滤器）
    - 全局异常映射
    - 简单鉴权（检查 JWT 是否存在/格式合法）

### 1.2 auth-service

- 负责：**认证 & 授权**
- 当前规划：
  - 数据库：MySQL 库 `creativehub_user`
  - 使用 Spring Data JPA 操作用户相关表
  - 使用 Spring Security + JWT 做无状态认证
- 核心职责：
  - 用户注册（写入 account + profile + 可选默认 address）
  - 用户登录（验证密码 & 状态，生成 JWT）
  - JWT 校验 & 提供用户信息解析能力（被其他服务复用）
  - 将来扩展：
    - 角色 / 权限管理（管理员、创作者等）
    - Refresh Token / Token 黑名单等

### 1.3 user-post-service

- 负责：**用户资料 / 帖子 / 评论 / 点赞 / 收藏 / 关注**
- 会使用自己的数据库或 schema（后续再细化表结构）
- 典型对象：
  - User（读取 `user_profile`）
  - Post / PostContent
  - Comment
  - LikeRecord / Favorite
  - Follow（关注关系）
- 后续会与 `media-service` 集成，通过 mediaId 引用各种媒体资源

### 1.4 media-service

- 负责：**媒体文件**（图片、视频、音频）
- 职责：
  - 上传接口（支持图片 & 视频 & 音频）
  - 将文件存储在 MinIO，记录在 `media_file` 表中
  - 生成媒体处理任务（media_task），通过 Kafka 异步执行
  - 提供媒体访问 URL 给前端 / 其他服务
- 将与 `ai-service` / `ai-service-client` 配合进行 AI 相关处理

### 1.5 ai-service-client（Java）

- 一个独立的“客户端封装模块”，被其他服务引用
- 封装调用 Python `ai-service` 的逻辑：
  - 统一请求 / 响应 DTO
  - 重试 / 超时控制
  - 日志 / traceId 透传
- 提供的调用示例：
  - `separateAudio(sourceUrl)` → 返回人声 / 伴奏的 URL
  - `enhanceImage(imageUrl)` → 返回增强后图像的 URL

### 1.6 ai-service（Python）

- 独立部署（容器或虚拟环境）
- 使用 FastAPI 提供 REST API：
  - `/audio/separate`
  - `/voice/clone`
  - `/image/enhance`
  - `/video/combine`
- 内部使用：
  - Demucs、RVC、GFPGAN、Real-ESRGAN、FFmpeg 等
- 和 Java 交互方式：
  - 直接 HTTP 调用
  - 或消费 Kafka 中的任务（根据后续设计）

### 1.7 admin-service

- 只给管理员使用的后台接口
- 调用其他服务的 API / Feign Client：
  - 用户管理：封禁、查看详情
  - 帖子管理：置顶、删除违法内容
  - 媒体管理：列出媒体、冻结/删除敏感资源
  - AI 任务管理：查看任务、重试失败
- 后续可以配一个独立前端（管理后台）

### 1.8 common 模块

- 用于复用代码：
  - `common-core`：工具类、基础常量
  - `common-web`：全局异常处理、统一响应封装 (`ApiResponse`)
  - `common-security`：JWT 工具类、通用 Security 配置片段
  - `common-mq`：Kafka 配置、通用生产者/消费者封装
  - `common-feign`：Feign 配置（拦截器、日志等）

---

## 2. 数据模型（当前已确定部分）

### 2.1 用户相关（库：`creativehub_user`）

#### 2.1.1 user_account（用户账号表）

- 用于：登录、鉴权、状态控制
- 主要字段：
  - `id`：主键
  - `username`：用户名（可为空，唯一）
  - `email`：邮箱（登录主键，唯一）
  - `phone`：手机号（可选，唯一）
  - `password_hash`：密码哈希（BCrypt）
  - `status`：0 正常；1 禁用；2 删除
  - `roles`：角色集合（如 `"USER"`、`"ADMIN"`；用逗号分隔）
  - `last_login_at`：最近登录时间
  - `created_at` / `updated_at`：审计字段

- 说明：
  - auth-service 登陆注册直接操作这张表
  - 将来可以扩展字段（如登录失败次数等）

#### 2.1.2 user_profile（用户资料表）

- 用于：展示信息
- 字段：
  - `id`：主键
  - `user_id`：关联 `user_account.id`
  - `nickname`：昵称
  - `avatar_url`：头像地址
  - `gender`：性别（0 未知，1 男，2 女）
  - `birthday`：生日
  - `bio`：个人简介
  - `created_at` / `updated_at`

- 说明：
  - user-post-service 等服务在展示用户信息时主要读这张表
  - 将来可以增加更多用户偏好字段

#### 2.1.3 user_address（用户地址表）

- 用于：用户地址（可多条）
- 字段：
  - `id`：主键
  - `user_id`：关联 `user_account.id`
  - `receiver_name`：收件人
  - `receiver_phone`：联系电话
  - `country`：国家，默认“中国”
  - `province` / `city` / `district`：省、市、区
  - `detail_address`：详细地址
  - `postal_code`：邮编
  - `is_default`：是否默认地址（0 否，1 是）
  - `created_at` / `updated_at`

- 说明：
  - 注册时可以不填地址
  - 填的话，创建一条 `is_default = 1` 的记录
  - 后续可以用在周边寄送、线下活动等场景

> 其他表，如帖子 / 评论 / 媒体 / AI 任务等尚未定表结构，会在后续阶段设计。

---

## 3. Auth 模块设计要点（JPA + Spring Security + JWT）

### 3.1 数据访问层

- JPA 实体：
  - `UserAccount` ↔ `user_account`
  - `UserProfile` ↔ `user_profile`
  - `UserAddress` ↔ `user_address`
- Repository：
  - `UserAccountRepository`
    - `findByEmail`
    - `findByUsername`
    - `findByPhone`
  - `UserProfileRepository`
  - `UserAddressRepository`

### 3.2 DTO 层（请求 / 响应）

- `RegisterRequest`
  - `email`, `password`, `nickname`
  - 可选：`address`（包含省、市、区、详细地址等字段）
- `LoginRequest`
  - `email`, `password`
- `LoginResponse`
  - `accessToken`
  - `refreshToken`（先预留）
- `AddressDto`
  - 与 `user_address` 的主要字段对应
- `ApiResponse<T>`
  - `code`, `message`, `data`

### 3.3 Service & 业务流程

**注册流程**

1. 校验 email 是否存在
2. 使用 `BCryptPasswordEncoder` 生成密码哈希
3. 创建 `UserAccount`（角色默认为 `"USER"`，status=0）
4. 创建默认 `UserProfile`（填写 nickname，其他可为空）
5. 如果请求中带地址：
   - 创建对应 `UserAddress` 记录
   - `is_default = 1`
6. 返回成功响应，不需要带 Token

**登录流程**

1. 根据 email 查询 `UserAccount`
2. 校验账号状态（禁用 / 删除则返回错误）
3. 使用 `BCryptPasswordEncoder.matches` 校验密码
4. 使用 JWT 生成 `accessToken`：
   - Payload 包含：`userId`, `email`, `roles`, `exp`
5. 更新 `last_login_at`
6. 返回 `LoginResponse`（accessToken + 预留 refreshToken 字段）

---

## 4. 安全与网关相关上下文

### 4.1 Spring Security 配置（目标状态）

- 使用 `SecurityFilterChain`（新版本写法）
- 关闭 CSRF（前后端分离）
- Session 策略设为 `STATELESS`
- 配置路径权限：
  - `/auth/register`, `/auth/login`, `/health` → `permitAll()`
  - 其他路径 → `authenticated()`
- 注入 `PasswordEncoder` 为 `BCryptPasswordEncoder`
- 增加 `JwtAuthenticationFilter`：
  - 从 `Authorization: Bearer xxx` 中解析 JWT
  - 验证签名 & 过期时间
  - 构造 `UsernamePasswordAuthenticationToken` 放入 SecurityContext

### 4.2 Gateway 路由及健康检查

- Gateway 应开启基于 Nacos 的自动服务发现路由：
  - `spring.cloud.gateway.discovery.locator.enabled=true`
- 当前约定健康检查：
  - 每个服务有 `/health` 简单字符串或简单 JSON 返回
  - 通过网关访问如：`GET /auth-service/health` → 转发至 auth-service

---

## 5. 开发阶段的“下一步”

1. 在 `creativehub_user` 库中执行用户相关建表 SQL（见总览文件）
2. 在 `auth-service` 中：
   - 配置 MySQL + JPA
   - 建立实体与 Repositories
   - 实现注册 / 登录接口
   - 配置 Spring Security + JWT 相关类
3. 配合 Gateway 调试：
   - 通过 `/auth-service/auth/register` & `/auth-service/auth/login` 完成注册/登录流程
   - 返回 JWT，并在后续服务中逐步接入鉴权

---

> 只要新对话能读取 `CREATIVEHUB_OVERVIEW.md` 和本文件，就可以在没有历史聊天上下文的前提下，完整理解 CreativeHub 项目当前的设计与进度，并继续开发。
