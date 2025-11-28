# CreativeHub 开发进度 & 任务看板

> 用来记录：做到哪了 / 正在做什么 / 下一步做什么。  
> ChatGPT / Cursor 在继续开发前，建议先看这个文件。

---

## 1. 已完成（Done）

### 1.1 基础设施

- [x] MySQL 安装 & 基础库创建
- [x] MinIO 使用 Docker 本地部署（9000 API / 9001 控制台），配置媒体持久化目录
- [x] Nacos 搭建 & 各服务注册成功
- [x] Spring Cloud Gateway 基本路由配置
- [x] 全局 CORS 问题排查 & 修复（包括 gateway-service 和后端 CORSConfig）

### 1.2 用户 / 认证模块（auth-service）

- [x] 账号表 user_account 与资料表 user_profile 设计
- [x] 用户注册（邮箱 + 密码 + 昵称 + 地区）
- [x] 用户登录（返回 JWT）
- [x] 基本用户信息查询接口

### 1.3 媒体系统（media-service）

- [x] media_file 表设计与创建（包含 original_name / display_name / md5）
- [x] MinIO 客户端配置（支持从 application.yml 读取 endpoint、access-key、secret-key、bucket）
- [x] 媒体上传接口（图片 / 视频 / 音频）
- [x] 将文件上传到 MinIO，并返回可访问 URL
- [x] 文件内容 MD5 去重（相同文件不重复上传、不重复写表）

### 1.4 帖子系统（user-post-service）

- [x] post 表、post_media 表设计与创建
- [x] 创建帖子接口：接收 content + mediaItems 数组，写入 post + post_media
- [x] 查询帖子详情接口：GET /posts/{id} 返回 PostDTO + 媒体列表
- [x] Feed 接口：GET /posts?page=&pageSize= 分页返回 PostDTO 列表
- [x] Service 通过 Feign / RestTemplate 调用 media-service 批量查询媒体信息

### 1.5 前端（frontend）

- [x] 项目初始化（React + Vite + Ant Design）
- [x] 登录 / 注册页 UI & 与后端联调
- [x] 主布局：左侧导航 + 中间 Feed + 右侧快捷入口，深色渐变风格
- [x] 首页静态 Feed 假数据（确定 UI 风格）
- [x] 发布作品页：
  - 文本输入区
  - 媒体上传组件（图片 / 视频 / 音频）
  - 媒体预览组件（删除等）
  - 调用 /media/upload 收集 mediaId
  - 调用 /posts 创建帖子

---

## 2. 正在进行（In Progress）

> 这些是当前阶段重点推进的内容。

### 2.1 首页 Feed 接入真实数据

- [ ] 在 Home 页中调用 GET /posts 接口
- [ ] 将真实帖子渲染在静态假数据上方
- [ ] UI 保持与现有假数据完全一致（头像、文本、媒体卡片、底部操作栏）

### 2.2 搜索帖子功能

- [ ] 后端：实现 GET /posts/search?keyword=&page=&pageSize=
- [ ] 前端：搜索框 onSearch 调用搜索接口，替换 realPosts
- [ ] 静态假数据始终显示在真实数据列表的下方

### 2.3 帖子详情页

- [ ] 前端新增 PostDetail 页面
- [ ] 配置路由：/post/:id
- [ ] 点击 Feed 卡片跳转到详情页
- [ ] 在详情页展示完整帖子信息（作者、时间、文本、媒体列表）
- [ ] 未来在详情页扩展评论列表

### 2.4 音频体验升级（统一 AudioPlayer 组件）

- [ ] 上传时写入 media_file.original_name / display_name
- [ ] 前端创建统一 AudioPlayer 组件：
  - 使用 Wavesurfer.js 渲染蓝色动态波形
  - 播放 / 暂停 / 拖动进度 / 显示当前时间和总时长 / 倍速播放
  - 显示 display_name（若为空则退回 original_name）
- [ ] Feed / 发布作品预览 / 帖子详情页统一使用 AudioPlayer

---

## 3. 下一阶段（Next）

> 当前 In Progress 内容完成后建议优先做这些。

### 3.1 点赞 / 收藏 / 评论基础能力

- [ ] 设计点赞表 / 评论表 / 收藏表
- [ ] user-post-service 增加：
  - POST /posts/{id}/like
  - POST /posts/{id}/comments
- [ ] 前端：接入 Feed 卡片底部 4 个按钮中的点赞和评论

### 3.2 用户主页 & 关注系统

- [ ] 用户主页页面：展示该用户发布的所有作品
- [ ] 关注关系表：follow(follower_id, followee_id)
- [ ] 接口：关注 / 取消关注 / 获取关注列表 / 粉丝数
- [ ] 首页 Feed 支持“仅看关注作者”的 tab（未来）

### 3.3 媒体异步处理基础设施

- [ ] 设计 media_task 表（任务类型、状态、输入媒体、输出媒体）
- [ ] 引入 Kafka（或先用简单队列 / 定时任务）
- [ ] 实现：
  - 图片缩略图生成
  - 视频封面截图
  - 音频波形数据预计算（存入数据库或对象存储）

---

## 4. 长期规划（Future）

### 4.1 AI 相关

- [ ] 音频分离（人声 / 伴奏），允许选择分离后的轨道发帖
- [ ] AI 人声模仿（RVC 等）
- [ ] AI 修图 / 调色 / 超分辨率
- [ ] 图像 + 音乐自动生成短视频（封面 + 波形可视化）

### 4.2 社区与玩法

- [ ] 作品标签系统（音乐风格 / 拍摄主题 / 设备）
- [ ] 搜索 & 推荐算法（基于标签、关注、热度）
- [ ] 专题 / 合集 / 挑战活动

---

## 5. 使用说明（给未来的“我”和 AI）

- 想知道项目整体做了什么 → 看《01_PROJECT_OVERVIEW.md》
- 想知道服务、表结构、流程 → 看《02_SYSTEM_DESIGN.md》
- 想写 / 调接口 → 看《03_API_REFERENCE.md》
- 想继续开发 → 先看本文件的 In Progress 和 Next，把勾从上往下打就行。
