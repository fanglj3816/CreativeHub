# CreativeHub API 简要说明

> 面向前端 / 测试 / AI 使用，仅记录当前已存在或近期已规划的主要接口。

---

## 1. 认证相关（auth-service）

### 1.1 用户注册

- URL：POST /auth/register
- Body 示例：

{
  "email": "test@example.com",
  "password": "123456",
  "nickname": "音乐人A",
  "regionCode": "CN-11"
}

- 返回：ApiResponse<UserDTO>

---

### 1.2 用户登录

- URL：POST /auth/login
- Body：

{
  "email": "test@example.com",
  "password": "123456"
}

- 返回：

{
  "code": 0,
  "message": "success",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "nickname": "音乐人A",
      "avatarUrl": "..."
    }
  }
}

前端需将 token 存储在 localStorage 等处，并在后续请求中带上 Header：

Authorization: Bearer <token>

---

## 2. 媒体相关（media-service）

### 2.1 上传媒体文件

- URL：POST /media/upload
- 描述：上传图片 / 视频 / 音频；内部有 MD5 去重
- 请求：multipart/form-data
  - file：文件
  - 可选 bizType：POST_IMAGE / POST_VIDEO / POST_AUDIO / AVATAR / AI_OUTPUT 等

- 响应示例：

{
  "code": 0,
  "message": "success",
  "data": {
    "id": 123,
    "url": "http://localhost:9000/creativehub-media/2025/...",
    "fileType": "AUDIO",
    "bizType": "POST_AUDIO",
    "displayName": "今天写的新歌demo.mp3",
    "durationSec": 99,
    "sizeBytes": 1234567
  }
}

---

### 2.2 批量查询媒体（建议/规划）

- URL：GET /media/batch?ids=1,2,3
- 描述：根据 mediaId 列表返回媒体元信息，给 user-post-service 使用
- 响应示例：

{
  "code": 0,
  "data": [
    {
      "id": 1,
      "url": "...",
      "fileType": "IMAGE",
      "displayName": "xxx",
      "durationSec": null
    }
  ]
}

---

## 3. 帖子相关（user-post-service）

统一前缀：/posts

### 3.1 创建帖子

- URL：POST /posts
- 需要鉴权（Authorization: Bearer ...）

请求体示例：

{
  "content": "今天写了一首新歌，快来听听吧！",
  "contentType": 3,
  "mediaItems": [
    { "mediaId": 101, "type": "AUDIO", "sortOrder": 0 },
    { "mediaId": 102, "type": "IMAGE", "sortOrder": 1 }
  ]
}

响应：

{
  "code": 0,
  "data": {
    "id": 66
  }
}

---

### 3.2 获取帖子详情

- URL：GET /posts/{id}

响应示例：

{
  "code": 0,
  "data": {
    "id": 66,
    "author": {
      "id": 1,
      "nickname": "Jay Chou",
      "avatarUrl": "..."
    },
    "content": "今天写了一首新歌，快来听听吧！",
    "contentType": 3,
    "mediaList": [
      {
        "id": 101,
        "url": "...",
        "fileType": "AUDIO",
        "displayName": "今天写的新歌demo.mp3",
        "durationSec": 99
      }
    ],
    "likeCount": 0,
    "commentCount": 0,
    "favoriteCount": 0,
    "createdAt": "2025-11-27T10:00:00"
  }
}

---

### 3.3 获取帖子 Feed（首页动态）

- URL：GET /posts
- 参数：
  - page：页码，从 1 开始
  - pageSize：每页条数

响应示例：

{
  "code": 0,
  "data": {
    "records": [
      {
        "id": 66,
        "author": { "id": 1, "nickname": "Jay Chou", "avatarUrl": "..." },
        "content": "今天写了一首新歌，快来听听吧！",
        "contentType": 3,
        "mediaList": [
          { "id": 101, "url": "...", "fileType": "AUDIO", "displayName": "今天写的新歌demo.mp3", "durationSec": 99 }
        ],
        "likeCount": 0,
        "commentCount": 0,
        "favoriteCount": 0,
        "createdAt": "2025-11-27T10:00:00"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 123
  }
}

前端需要将真实数据渲染在静态假数据之上。

---

### 3.4 搜索帖子（规划）

- URL：GET /posts/search
- 参数：
  - keyword：关键词
  - page
  - pageSize

说明：

- 在 post.content（以及未来的标题、标签）上做模糊搜索
- 返回结构与 GET /posts 相同

---

## 4. 未来可能新增的接口（TODO）

- 点赞：
  - POST /posts/{id}/like
  - DELETE /posts/{id}/like
- 收藏：
  - POST /posts/{id}/favorite
- 评论：
  - POST /posts/{id}/comments
  - GET /posts/{id}/comments
- 关注：
  - POST /users/{id}/follow
  - DELETE /users/{id}/follow
- AI 工具：
  - POST /ai/audio/separate
  - POST /ai/image/enhance
  - POST /ai/video/generate
