# CreativeHub 系统设计说明

> 版本：v0.2  
> 用途：给需要看架构和数据结构的人 / Cursor / ChatGPT 使用。

## 1. 总体架构

### 1.1 架构风格

- 前后端分离 + 微服务
- 核心服务：
  - gateway-service
  - auth-service
  - user-post-service
  - media-service
  - （规划）ai-service & ai-service-client
- 基础组件：
  - Nacos：服务注册 & 配置
  - MySQL：数据存储
  - MinIO：对象存储
  - （规划）Kafka：异步任务

所有前端请求经由 Gateway 进入，再路由到各后端服务。

---

## 2. 服务设计

### 2.1 gateway-service

- 统一入口网关，基于 Spring Cloud Gateway
- 职责：
  - 路由转发：/auth/**、/posts/**、/media/**
  - 统一 CORS 处理（目前跨域问题已在这里解决）
  - 未来扩展：统一鉴权、限流、灰度发布

---

### 2.2 auth-service / user-service

- 职责：
  - 用户注册 / 登录
  - 用户账号状态（正常 / 禁用 / 删除）
  - 用户展示信息（昵称、头像、简介）

- 核心表：

1）user_account：账号信息

- id
- email（唯一）
- password_hash
- status：0 正常，1 禁用，2 删除
- roles：USER / ADMIN 等
- last_login_at
- created_at / updated_at

2）user_profile：展示信息

- id
- user_id（关联 user_account.id）
- nickname
- avatar_url
- gender
- birthday
- bio
- created_at / updated_at

3）user_address：扩展信息（当前社区场景中暂不关键）

---

### 2.3 user-post-service（内容系统）

- 职责：
  - 帖子（Post）的创建、查询
  - 帖子与媒体的关联
  - 未来扩展：点赞、收藏、评论、关注、话题标签

#### 2.3.1 post 表

代表一条动态 / 作品：

- id
- author_id：关联 user_account.id
- content：文本内容
- content_type：0 文本、1 图文、2 视频、3 音频、4 AI 作品等
- visibility：预留字段（公开 / 私密 / 粉丝可见）
- like_count / comment_count / favorite_count：冗余统计
- created_at / updated_at

#### 2.3.2 post_media 表

帖子与媒体的多对多关系表：

- id
- post_id：关联 post.id
- media_id：关联 media_file.id
- sort_order：展示顺序
- usage_type：0 普通图、1 封面、2 音频、3 视频、4 AI 输出等
- created_at / updated_at

一个帖子可以绑定多种媒体（多图、多音频、多视频等）。

---

### 2.4 media-service（媒体系统）

- 职责：
  - 接收文件上传（图片 / 视频 / 音频）
  - 计算文件 MD5，做去重
  - 上传到 MinIO，记录元数据
  - 提供媒体查询接口（单个 / 批量）

#### 2.4.1 media_file 表

当前设计为：

```sql
CREATE TABLE media_file (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    owner_id        BIGINT NOT NULL COMMENT '上传者 user_id',
    biz_type        VARCHAR(50) NOT NULL COMMENT '业务类型：POST_IMAGE, POST_VIDEO, AVATAR, AI_OUTPUT 等',
    file_type       VARCHAR(20) NOT NULL COMMENT 'IMAGE / VIDEO / AUDIO',
    url             VARCHAR(255) NOT NULL COMMENT '可访问 URL（MinIO 公网路径或反向代理地址）',
    storage_path    VARCHAR(255) NOT NULL COMMENT '存储路径（MinIO object key）',
    original_name   VARCHAR(255) NULL COMMENT '上传时的原始文件名',
    display_name    VARCHAR(255) NULL COMMENT '用于展示的名称，可为空，为空时前端回退到 original_name',
    size_bytes      BIGINT NULL COMMENT '文件大小字节数',
    duration_sec    INT NULL COMMENT '音频/视频时长（秒）',
    width           INT NULL COMMENT '宽度（图片/视频）',
    height          INT NULL COMMENT '高度（图片/视频）',
    md5             VARCHAR(64) NULL COMMENT '文件内容 MD5，用于去重',
    status          TINYINT NOT NULL DEFAULT 0 COMMENT '处理状态：0正常 1处理中 2失败',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_owner (owner_id),
    KEY idx_biz (biz_type),
    KEY idx_ftype (file_type),
    KEY idx_md5 (md5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='媒体文件表';
```

- 去重逻辑：
  - 上传文件 → 计算 MD5
  - 查询 media_file.md5 是否存在
  - 若存在：直接返回已有记录（不重新上传 MinIO / 不新增记录）
  - 若不存在：上传 MinIO，写入一条新记录

---

### 2.5 ai-service & ai-service-client（规划）

- ai-service（Python）：
  - 音频分离（人声 / 伴奏）
  - AI 人声模仿
  - 图像调色 / 超分 / 去噪
  - 图像 + 音频合成短视频

- ai-service-client（Java）：
  - 面向 Java 服务封装统一调用接口
  - 做好超时重试、熔断、统一 DTO

---

## 3. 核心业务流程

### 3.1 注册 / 登录

1. 前端调用 POST /auth/register → 创建 user_account + user_profile
2. 前端调用 POST /auth/login → 返回 JWT
3. 前端保存 JWT 到 localStorage
4. 后续请求在 Header 带上 Authorization: Bearer <token>
5. 微服务解析 JWT 获取 userId，用于 owner_id / author_id 等字段

---

### 3.2 媒体上传流程

1. 前端选择文件（图片 / 视频 / 音频）
2. 调用 POST /media/upload，使用 multipart/form-data，字段 file
3. media-service：
   - 计算 MD5
   - 查找 md5 是否存在于 media_file
   - 存在：直接返回已有记录
   - 不存在：上传到 MinIO，生成新记录
4. 响应中返回：
   - id（mediaId）
   - url
   - file_type
   - display_name / original_name
   - duration_sec（音频/视频）

前端在发帖页面中将 mediaId 保存到 mediaItems 数组中。

---

### 3.3 创建帖子流程

1. 用户在前端输入文本 + 上传媒体（一步步上传）
2. 每上传一个媒体，调用 /media/upload，拿到 mediaId
3. 前端最终调用 POST /posts，Body 大致为：

```json
{
  "content": "今天写了一首新歌，快来听听吧！",
  "contentType": 3,
  "mediaItems": [
    { "mediaId": 101, "type": "AUDIO", "sortOrder": 0 },
    { "mediaId": 102, "type": "IMAGE", "sortOrder": 1 }
  ]
}
```

4. user-post-service：
   - 从 JWT 解析出 userId → authorId
   - 新建 post 记录
   - 写入多条 post_media 记录
5. 返回新建帖子 id / PostDTO

---

### 3.4 首页 Feed 流程

1. 前端调用 GET /posts?page=1&pageSize=10
2. user-post-service：
   - 分页查询 post（按 created_at desc）
   - 根据 post_id 查询 post_media
   - 批量调用 media-service 获取 media_file 列表
   - 组装 PostDTO 返回：
     - author 信息（通过 user-service 查询或缓存）
     - 内容 content / contentType
     - mediaList（包含 url / fileType / displayName / durationSec）
3. 前端：
   - 将真实 PostDTO 列表渲染在页面顶部
   - 现有静态假数据渲染在真实数据下方

---

### 3.5 搜索帖子（规划）

1. 前端在首页搜索框输入关键字
2. 调用 GET /posts/search?keyword=&page=&pageSize=
3. 后端在 post.content（以及未来的标题 / 标签）做模糊查询
4. 返回结果结构与 GET /posts 一致
5. 前端用搜索结果替换 realPosts，假数据仍保留在下方

---

### 3.6 音频播放 & 波形可视化（前端规划）

1. 前端实现统一 AudioPlayer 组件：
   - 使用 Wavesurfer.js 渲染蓝色波形
   - 播放 / 暂停 / 拖拽进度 / 倍速
   - 显示 display_name 和 durationSec
2. Feed / 发帖预览 / 帖子详情页统一使用 AudioPlayer

---

## 4. 目录结构（概览）

### 4.1 backend

示意结构：

- backend/
  - gateway-service/
  - auth-service/
  - user-post-service/
  - media-service/
  - common/
    - common-core/
    - common-feign/
    - common-web/

### 4.2 frontend

示意结构：

- frontend/
  - src/
    - api/
      - auth.ts
      - post.ts
      - media.ts
    - components/
      - FeedCard.tsx
      - AudioPlayer.tsx（规划）
      - ...
    - pages/
      - AuthPage/
      - Home/
      - CreatePost/
      - PostDetail/（规划）

本文件用于帮助 AI / Cursor 快速定位应该修改哪个服务、哪一层代码。
