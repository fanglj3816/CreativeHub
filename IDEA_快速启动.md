# IDEA 快速启动指南（简化版）

## 🚀 三步启动后端服务

### 第一步：启动 Gateway Service

1. **打开文件**：
   ```
   backend/gateway-service/src/main/java/com/creativehub/gateway/GatewayServiceApplication.java
   ```

2. **点击运行**：
   - 找到第 10 行的 `main` 方法
   - 点击左侧绿色三角形 ▶️ 或右键选择 `Run 'GatewayServiceApplication'`

3. **等待启动完成**：
   - 看到日志：`Started GatewayServiceApplication` 表示成功
   - 端口：`8000`

### 第二步：启动 Auth Service

1. **打开文件**：
   ```
   backend/auth-service/src/main/java/com/creativehub/auth/AuthServiceApplication.java
   ```

2. **点击运行**：
   - 找到第 10 行的 `main` 方法
   - 点击左侧绿色三角形 ▶️ 或右键选择 `Run 'AuthServiceApplication'`

3. **等待启动完成**：
   - 看到日志：`Started AuthServiceApplication` 表示成功
   - 端口：随机（查看日志中的端口号）

### 第三步：验证服务

1. **访问 Nacos 控制台**：`http://localhost:8848/nacos`
   - 账号：`nacos` / `nacos`
   - 查看服务列表，应该能看到两个服务

2. **测试接口**：
   ```bash
   curl http://localhost:8000/api/auth/health
   ```

---

## 📍 关键文件位置

| 服务 | 主类文件路径 |
|------|------------|
| Gateway | `backend/gateway-service/src/main/java/com/creativehub/gateway/GatewayServiceApplication.java` |
| Auth | `backend/auth-service/src/main/java/com/creativehub/auth/AuthServiceApplication.java` |

---

## ⚡ 快捷键

- **运行**：`Shift + F10` (Windows/Linux) / `Ctrl + R` (Mac)
- **调试**：`Shift + F9` (Windows/Linux) / `Ctrl + D` (Mac)
- **停止**：`Ctrl + F2` (Windows/Linux) / `Cmd + F2` (Mac)

---

## 🔍 查看运行的服务

在 IDEA 底部工具栏：
- **Run** 窗口：查看所有正在运行的服务
- 可以在这里停止、重启服务

---

## ❗ 注意事项

1. **启动顺序**：必须先启动 Gateway，再启动 Auth Service
2. **端口冲突**：如果端口被占用，检查是否有其他实例在运行
3. **Nacos 必须运行**：确保 Nacos 在 `localhost:8848` 运行

---

详细说明请查看：`IDEA_START_GUIDE.md`

