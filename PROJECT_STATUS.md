# CreativeHub 项目状态文档

> 最后更新：2025-11-26
> 本文档用于新对话快速了解项目当前状态

## 📋 项目概述

**CreativeHub** 是一个创意分享与 AI 创作平台，采用微服务架构。

### 技术栈
- **后端**：Spring Boot 3.2.4 + Spring Cloud Alibaba 2023.0.1.0
- **前端**：React 19 + TypeScript + Vite + Ant Design 6.0
- **服务注册**：Nacos
- **数据库**：MySQL 8.0
- **认证**：JWT (jjwt 0.12.3)

---

## 🏗️ 项目结构

```
CreativeHub/
├── backend/              # 后端微服务
│   ├── gateway-service/   # 网关服务 (端口: 8000)
│   ├── auth-service/      # 认证服务 (随机端口)
│   ├── user-post-service/ # 用户和帖子服务
│   ├── media-service/     # 媒体服务
│   ├── ai-service-client/ # AI 服务客户端
│   └── common/            # 公共模块
├── frontend/              # 前端项目 (端口: 5173)
├── ai-service/            # Python AI 服务
└── docs/                  # 项目文档
```

---

## ✅ 已完成功能

### 1. 基础设施
- ✅ Spring Cloud Gateway 配置完成
- ✅ Nacos 服务注册与发现配置完成
- ✅ 所有服务成功注册到 Nacos
- ✅ Gateway CORS 配置完成（通过 CorsConfig 类）

### 2. 认证服务 (auth-service)
- ✅ 数据库实体：UserAccount, UserProfile, UserAddress
- ✅ JPA Repository 接口
- ✅ JWT 认证实现
- ✅ Spring Security 配置（无状态 JWT）
- ✅ 注册接口：`POST /api/auth/register`
- ✅ 登录接口：`POST /api/auth/login`
- ✅ 健康检查接口：`GET /health`

### 3. 前端项目 (frontend)
- ✅ React + TypeScript + Vite 项目创建
- ✅ Ant Design UI 框架集成
- ✅ React Router v6 路由配置
- ✅ Axios 拦截器（自动注入 token，401 自动跳转）
- ✅ 登录页面 (`/login`)
- ✅ 注册页面 (`/register`)
- ✅ 首页 (`/`) - 需要认证
- ✅ 路由保护（未登录自动跳转）

---

## 🔧 当前配置

### 服务端口
- **Gateway**: `8000` (固定端口)
- **Auth Service**: 随机端口（由 Spring Boot 自动分配，已注册到 Nacos）
- **Frontend**: `5173` (Vite 默认端口)

### 数据库配置
- **数据库名**: `creativehub_user`
- **地址**: `localhost:3306`
- **用户名**: `root`
- **密码**: `123456`
- **表结构**:
  - `user_account` - 用户账号表
  - `user_profile` - 用户资料表
  - `user_address` - 用户地址表

### Nacos 配置
- **地址**: `localhost:8848`
- **已注册服务**:
  - `gateway-service`
  - `auth-service`

### API 端点
- **Gateway 基础地址**: `http://localhost:8000`
- **注册**: `POST /api/auth/register`
- **登录**: `POST /api/auth/login`
- **健康检查**: `GET /api/auth/health` 或直接访问服务端口 `/health`

---

## 📁 重要文件位置

### 后端关键文件
```
backend/gateway-service/
  ├── src/main/resources/application.yml          # Gateway 配置
  └── src/main/java/.../config/CorsConfig.java   # CORS 配置类

backend/auth-service/
  ├── src/main/resources/application.yml         # 数据库和 JWT 配置
  ├── src/main/java/.../entity/                  # 实体类
  ├── src/main/java/.../repository/              # Repository 接口
  ├── src/main/java/.../service/AuthService.java # 业务逻辑
  ├── src/main/java/.../controller/              # 控制器
  └── src/main/java/.../security/                # Security 和 JWT 配置
```

### 前端关键文件
```
frontend/
  ├── src/api/auth.ts              # API 配置（baseURL: http://localhost:8000）
  ├── src/pages/                   # 页面组件
  │   ├── Login.tsx
  │   ├── Register.tsx
  │   └── Home.tsx
  ├── src/router/index.tsx         # 路由配置
  └── package.json                 # 依赖已安装（antd, axios, react-router-dom）
```

---

## 🚀 运行状态

### 当前运行的服务
- ✅ **Gateway Service** - 运行在 8000 端口
- ✅ **Auth Service** - 运行中，已注册到 Nacos
- ✅ **Frontend** - 运行在 5173 端口
- ✅ **Nacos** - 运行在 8848 端口
- ✅ **MySQL** - 运行在 3306 端口（Docker）

### 测试结果
- ✅ Gateway CORS 配置正常（OPTIONS 请求返回 200）
- ✅ 注册接口正常工作
- ✅ 登录接口正常工作
- ✅ 前端页面正常显示

---

## 🔑 关键配置说明

### JWT 配置
- **Secret**: `creativehub-secret-key-change-in-production` (生产环境需修改)
- **过期时间**: 2 小时 (7200000 毫秒)
- **Token 存储**: localStorage.token

### CORS 配置
- **配置方式**: 通过 `CorsConfig.java` 类配置
- **允许来源**: 所有来源 (`*`)
- **允许方法**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **允许凭证**: true

### 安全配置
- **Session 策略**: STATELESS（无状态）
- **CSRF**: 已禁用
- **密码加密**: BCryptPasswordEncoder
- **受保护路由**: 除 `/auth/register`, `/auth/login`, `/health` 外都需要认证

---

## 📝 API 响应格式

### 统一响应结构
```json
{
  "code": 0,           // 0: 成功, 非0: 错误码
  "message": "success",
  "data": {}           // 响应数据
}
```

### 错误码
- `0` - 成功
- `1001` - 邮箱已存在
- `1002` - 用户不存在或密码错误
- `1003` - 账号已被禁用
- `1004` - 参数验证失败

### 登录响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": null
  }
}
```

---

## 🐛 已知问题与解决方案

### 已解决的问题
1. ✅ **Gateway CORS 500 错误** - 已通过创建 `CorsConfig.java` 解决
2. ✅ **TypeScript 类型导入错误** - 已修复为 `import type`
3. ✅ **Health 接口 Gateway 序列化问题** - 已简化为只返回基本字段

---

## 🔄 启动命令

### 后端服务
```bash
# Gateway Service
cd backend/gateway-service
mvn spring-boot:run

# Auth Service
cd backend/auth-service
mvn spring-boot:run
```

### 前端
```bash
cd frontend
npm run dev
```

---

## 📌 下一步计划（待实现）

### 后端
- [ ] 用户资料管理接口
- [ ] 帖子相关功能（user-post-service）
- [ ] 媒体上传功能（media-service）
- [ ] AI 服务集成

### 前端
- [ ] 用户资料页面
- [ ] 帖子列表和详情页
- [ ] 媒体上传组件
- [ ] 路由优化和布局组件

---

## 💡 开发提示

1. **查看服务注册状态**: 访问 `http://localhost:8848/nacos` 查看服务列表
2. **测试 API**: 使用 curl 或 Postman 测试接口
3. **前端开发**: 修改代码后 Vite 会自动热更新
4. **数据库连接**: 确保 MySQL Docker 容器正在运行
5. **端口冲突**: 如果端口被占用，检查 `lsof -i :端口号`

---

## 📞 快速参考

- **前端地址**: http://localhost:5173
- **Gateway 地址**: http://localhost:8000
- **Nacos 控制台**: http://localhost:8848/nacos
- **数据库**: localhost:3306/creativehub_user (root/123456)

---

*本文档会在项目进展时更新，建议定期查看最新状态。*


