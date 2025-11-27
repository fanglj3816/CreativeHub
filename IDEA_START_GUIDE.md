# IDEA 启动后端服务指南

## 📋 前置准备

### 1. 确保依赖已安装
在 IDEA 中打开项目后，Maven 会自动下载依赖。如果未自动下载：
- 右键点击 `backend/pom.xml` → `Maven` → `Reload Project`
- 或者打开 Maven 工具窗口（View → Tool Windows → Maven），点击刷新按钮

### 2. 确保服务已配置
- **Nacos** 运行在 `localhost:8848`
- **MySQL** 运行在 `localhost:3306`（Docker）
- 数据库：`creativehub_user`，用户名：`root`，密码：`123456`

---

## 🚀 启动步骤

### 方式一：使用 IDEA 运行配置（推荐）

#### 1. 创建运行配置

**启动 Gateway Service：**

1. 打开文件：`backend/gateway-service/src/main/java/com/creativehub/gateway/GatewayServiceApplication.java`
2. 找到 `main` 方法，点击左侧绿色运行按钮 ▶️
3. 选择 `Run 'GatewayServiceApplication'`
4. 或者右键点击类名 → `Run 'GatewayServiceApplication'`

**启动 Auth Service：**

1. 打开文件：`backend/auth-service/src/main/java/com/creativehub/auth/AuthServiceApplication.java`
2. 找到 `main` 方法，点击左侧绿色运行按钮 ▶️
3. 选择 `Run 'AuthServiceApplication'`

#### 2. 配置运行参数（可选）

如果需要自定义 JVM 参数或环境变量：

1. 点击 `Run` → `Edit Configurations...`
2. 选择对应的运行配置（如 `GatewayServiceApplication`）
3. 在 `VM options` 中添加参数，例如：
   ```
   -Xms512m -Xmx1024m
   ```
4. 在 `Environment variables` 中添加环境变量，例如：
   ```
   NACOS_SERVER_ADDR=localhost:8848
   ```

#### 3. 启动顺序

**重要：必须先启动 Gateway，再启动其他服务**

1. **第一步**：启动 `GatewayServiceApplication`
   - 等待看到日志：`Started GatewayServiceApplication in X.XXX seconds`
   - 端口：`8000`

2. **第二步**：启动 `AuthServiceApplication`
   - 等待看到日志：`Started AuthServiceApplication in X.XXX seconds`
   - 端口：随机（由 Spring Boot 自动分配）

---

### 方式二：使用 Maven 运行（在 IDEA 终端中）

#### 1. 打开 IDEA 终端

- `View` → `Tool Windows` → `Terminal`
- 或快捷键：`Alt + F12` (Windows/Linux) / `Option + F12` (Mac)

#### 2. 启动 Gateway Service

```bash
cd backend/gateway-service
mvn spring-boot:run
```

#### 3. 启动 Auth Service（新开一个终端窗口）

在 IDEA 中：
- 点击终端窗口右上角的 `+` 按钮，创建新终端
- 或使用快捷键：`Ctrl + Shift + T` (Windows/Linux) / `Cmd + T` (Mac)

然后运行：

```bash
cd backend/auth-service
mvn spring-boot:run
```

---

## 🔍 验证服务是否启动成功

### 1. 查看控制台日志

**Gateway Service 成功标志：**
```
Started GatewayServiceApplication in X.XXX seconds (JVM running for X.XXX)
```

**Auth Service 成功标志：**
```
Started AuthServiceApplication in X.XXX seconds (JVM running for X.XXX)
```

### 2. 检查 Nacos 注册

1. 打开浏览器访问：`http://localhost:8848/nacos`
2. 默认账号：`nacos` / `nacos`
3. 进入 `服务管理` → `服务列表`
4. 应该能看到：
   - `gateway-service`
   - `auth-service`

### 3. 测试接口

**测试 Gateway：**
```bash
curl http://localhost:8000/api/auth/health
```

**测试 Auth Service 健康检查：**
```bash
# 先查看 auth-service 的实际端口（在启动日志中）
curl http://localhost:实际端口/health
```

---

## 🛠️ IDEA 常用操作

### 停止服务

1. **停止单个服务**：
   - 在 `Run` 工具窗口（View → Tool Windows → Run）
   - 选择对应的运行配置
   - 点击红色停止按钮 ⏹️

2. **停止所有服务**：
   - `Run` → `Stop All`

### 查看日志

1. **控制台日志**：
   - 在 `Run` 工具窗口查看实时日志
   - 可以搜索、过滤日志内容

2. **日志文件**（如果配置了）：
   - 通常在项目根目录的 `logs` 文件夹

### 调试模式

1. 右键点击 `main` 方法
2. 选择 `Debug 'XxxApplication'`
3. 可以设置断点进行调试

---

## ⚠️ 常见问题

### 1. 端口被占用

**错误信息：**
```
Port 8000 is already in use
```

**解决方法：**
- 查找占用端口的进程：`lsof -i :8000`
- 停止占用端口的进程
- 或修改 `application.yml` 中的端口配置

### 2. 无法连接到 Nacos

**错误信息：**
```
com.alibaba.nacos.api.exception.NacosException: endpoint is blank
```

**解决方法：**
- 确保 Nacos 服务正在运行
- 检查 `application.yml` 中的 Nacos 地址配置
- 确认防火墙未阻止连接

### 3. 数据库连接失败

**错误信息：**
```
Communications link failure
```

**解决方法：**
- 确保 MySQL Docker 容器正在运行
- 检查数据库连接配置（用户名、密码、数据库名）
- 确认数据库已创建：`creativehub_user`

### 4. 依赖下载失败

**解决方法：**
- 检查网络连接
- 在 IDEA 中：`File` → `Invalidate Caches / Restart...`
- 重新加载 Maven 项目

---

## 📝 启动顺序总结

```
1. 启动 Nacos（如果未运行）
   ↓
2. 启动 MySQL（Docker，如果未运行）
   ↓
3. 启动 Gateway Service
   ↓
4. 启动 Auth Service
   ↓
5. 启动前端（npm run dev）
```

---

## 💡 提示

1. **使用 IDEA 的运行配置**可以保存多个服务的启动配置，方便一键启动
2. **使用 Maven 工具窗口**可以快速执行 Maven 命令
3. **配置日志级别**：在 `application.yml` 中设置 `logging.level` 来调整日志详细程度
4. **热部署**：修改代码后，IDEA 会自动重新编译，但需要手动重启服务（或使用 Spring Boot DevTools）

---

## 🔗 相关文件

- Gateway 主类：`backend/gateway-service/src/main/java/com/creativehub/gateway/GatewayServiceApplication.java`
- Auth 主类：`backend/auth-service/src/main/java/com/creativehub/auth/AuthServiceApplication.java`
- Gateway 配置：`backend/gateway-service/src/main/resources/application.yml`
- Auth 配置：`backend/auth-service/src/main/resources/application.yml`

