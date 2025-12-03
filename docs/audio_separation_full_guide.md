# 音频分离环境安装与踩坑总结（最终整合版）

更新时间：2025-12-02 07:51:03  
适用系统：macOS（Homebrew）  
服务方式：Python FastAPI + Demucs + UVR/Roformer + Supervisor 后台管理  
适用项目：CreativeHub 音频分离模块

---

# 📌 第一部分：项目整体架构（最终版）

本项目的音频分离模块采用如下架构：

```
Java 后端（业务 API）
       ↓ HTTP
Python FastAPI 音频 AI 服务（Supervisor 后台守护）
       ↓
分离模型（Demucs 4轨/6轨 + UVR/Roformer）
```

服务特点：

- 不再使用 Docker  
- 使用本地虚拟环境 `demucs310`  
- FastAPI 常驻后台，由 Supervisor 管理  
- 崩溃自动重启  
- Java 通过 HTTP 调用 Python 服务接口  
- 所有模型统一放在 `ai-service/audio_models/`  

---

# 📌 第二部分：模型说明

## 1. UVR / Roformer（人声分离）
- 模型必须单独下载  
- 体积巨大（639MB）  
- `.ckpt` 格式  
- 放在：`ai-service/audio_models/`

## 2. Demucs（4轨/6轨）
- 模型由 pip 安装自动缓存  
- 无需你手动下载  
- 版本为 Demucs v4（强制依赖 torchcodec）  
- 虚拟环境内运行：`~/demucs310/bin/demucs`

---

# 📌 第三部分：虚拟环境 demucs310

所有依赖已统一到：

```
~/demucs310/
```

包含：

- demucs v4  
- audio-separator  
- torchcodec  
- fastapi  
- uvicorn  
- numpy < 2  
- 所有模型依赖  

使用时可通过 alias（不污染系统 Python）：

```bash
alias demucs="$HOME/demucs310/bin/demucs"
alias uvicorn="$HOME/demucs310/bin/uvicorn"
alias python310="$HOME/demucs310/bin/python"
alias pip310="$HOME/demucs310/bin/pip"
```

---

# 📌 第四部分：Supervisor 后台管理（最新正式方案）

## 1. 安装 Supervisor

```bash
brew install supervisor
```

确认：

```bash
supervisord -v
which supervisord
which supervisorctl
```

---

## 2. Supervisor 配置目录（Mac Homebrew 专用）

Supervisor 主配置文件：

```
/opt/homebrew/etc/supervisord.conf
```

Supervisor 子配置目录（需手动创建）：

```
/opt/homebrew/etc/supervisor.d/
```

创建：

```bash
sudo mkdir -p /opt/homebrew/etc/supervisor.d
```

---

## 3. 创建 AI 服务配置文件

```
sudo pico /opt/homebrew/etc/supervisor.d/ai-service.conf
```

写入：

```ini
[program:ai_service]
command=/Users/fangliangjun/demucs310/bin/uvicorn app:app --host 0.0.0.0 --port 8001
directory=/Users/fangliangjun/MyProject/CreativeHub/ai-service

autostart=true
autorestart=true

stdout_logfile=/Users/fangliangjun/MyProject/CreativeHub/ai-service/logs/ai_service.out.log
stderr_logfile=/Users/fangliangjun/MyProject/CreativeHub/ai-service/logs/ai_service.err.log
stdout_logfile_maxbytes=10MB
stderr_logfile_maxbytes=10MB

user=fangliangjun
redirect_stderr=false
```

日志目录：

```bash
mkdir -p /Users/fangliangjun/MyProject/CreativeHub/ai-service/logs
```

---

## 4. 修改 supervisord.conf 以加载子配置

编辑：

```bash
sudo pico /opt/homebrew/etc/supervisord.conf
```

确保包含：

```ini
[include]
files = /opt/homebrew/etc/supervisor.d/*.conf
```

否则 ai-service.conf 不会被加载。

---

## 5. 启动 Supervisor

首次启动：

```bash
supervisord -c /opt/homebrew/etc/supervisord.conf
```

检查：

```bash
ps aux | grep supervisord
```

---

## 6. 加载配置 + 启动服务

```bash
supervisorctl reread
supervisorctl update
supervisorctl start ai_service
```

查看状态：

```bash
supervisorctl status
```

输出为 RUNNING 即成功。

---

## 7. 常用 Supervisor 命令

| 操作 | 命令 |
|------|------|
| 启动服务 | `supervisorctl start ai_service` |
| 停止服务 | `supervisorctl stop ai_service` |
| 重启服务 | `supervisorctl restart ai_service` |
| 重载配置 | `supervisorctl reread && supervisorctl update` |
| 查看状态 | `supervisorctl status` |
| 查看日志 | `tail -f logs/*.log` |

---

# 📌 第五部分：Python AI 服务启动说明

服务通过 supervisor 托管，无需手动启动  
但如需单独启动（调试模式）：

```bash
cd ai-service
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

接口文档访问：

```
http://localhost:8001/docs
```

---

# 📌 第六部分：Java 调用 Python AI 服务（概念说明）

Java 端可直接通过 HTTP POST 将音频文件传给 Python AI 服务：

```java
RestTemplate rt = new RestTemplate();
MultiValueMap<String, Object> data = new LinkedMultiValueMap<>();
data.add("file", new FileSystemResource(filePath));

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.MULTIPART_FORM_DATA);

HttpEntity<?> request = new HttpEntity<>(data, headers);
String result = rt.postForObject("http://localhost:8001/separate/vocal", request, String.class);
```

---

# 📌 第七部分：常见错误与解决方案

### ❗ `No config updates to processes`
原因：supervisord.conf 未 include supervisor.d  
解决：添加 include。

### ❗ 日志报错：模型不存在  
检查模型路径和配置。

### ❗ 端口失败  
检查 supervisor 状态与错误日志。

---

# 📌 第八部分：总结（正式版）

你当前的系统结构已经专业可用：

- 使用 **Demucs v4** + **Roformer**
- 不使用 Docker，性能大幅提升
- FastAPI 由 supervisor 后台托管
- Java 通过 HTTP 调用 Python
- 所有配置与目录均已标准化

本文件可作为最终部署文档使用。
