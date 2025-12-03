# 音频分离环境安装与踩坑总结（更新版）

> 更新时间：2025-12-02 07:20:43  
> 适用于：macOS + Python3.10 + 非 Docker + 本地虚拟环境 + FastAPI 服务  
> 说明：基于你实际踩过的坑、修复过程、以及当前项目最终采用的方案整理。

---

# 🧩 一、总体架构变化（非常关键）

### ✅ 旧方案（已废弃）
- 使用 Docker 容器运行人声分离（beveradb/audio-separator）
- 每次调用都要 `docker run`
- 模型、环境不稳定
- 无法整合到 Java 后端

### ⭐ 新方案（当前稳定方案）
1. **完全抛弃 Docker**
2. 使用本地虚拟环境 `demucs310`
3. 直接安装  
   - `audio-separator`（用于 UVR/Roformer 人声分离）  
   - `demucs`（用于 4轨 / 6轨 分离）  
   - `torchcodec`（Demucs v4 必须）
4. 使用 **FastAPI** 启动 Python 音频服务  
5. Java 后端通过 HTTP 调用服务

---

# 🧩 二、为什么 Docker 被废弃？

## 原因：
1. 经常性挂起 / 性能差  
2. 无法一次加载大模型（每次 run 都慢）  
3. 无法灵活集成到 Java Web 项目  
4. 模型管理困难

## 现在：
- 所有操作都变为本地命令行执行  
- 性能提升 5～10 倍  
- 可做成后台常驻服务

---

# 🧩 三、虚拟环境 demucs310（全部依赖装在这里）
你目前的工作环境：

```
~/demucs310/
```

包含：

- demucs v4（4/6轨）
- audio-separator（UVR / Roformer）
- torchcodec（Demucs 保存音频必须）
- fastapi、uvicorn
- 所有模型依赖

---

# 🧩 四、森林里最大的坑：Demucs v3 / v4 混乱问题

你踩过的最大坑是：

### ❗ 本地 CLI 和 FastAPI 中调用的 demucs 不是同一个版本

| 场景 | 实际版本 | 行为 |
|------|---------|--------|
| 你以前本地测试成功的环境 | **Demucs v3** | 使用 `soundfile` 保存 → 不需要 torchcodec |
| FastAPI 子进程执行的 demucs | **Demucs v4** | 保存音频需要 torchcodec → 报错 |

### 最终解决办法：
- 明确使用 **Demucs v4**
- 安装 `torchcodec`
- 保证 FastAPI 调用的是 v4

现在虚拟环境里已统一为 **v4**，环境完全稳定。

---

# 🧩 五、为什么人声分离必须下载 639MB 模型？

原因：

- UVR（Roformer）模型是 **独立的大模型**（.ckpt）
- 不随 audio-separator 安装
- 每个 200MB～1GB

对比：

- Demucs 的模型是 pip 内置（或 torch hub 自动缓存）
- 所以你感觉“demucs 不用下载”

---

# 🧩 六、命令别名 alias（解决本地命令找不到的问题）

你的本地 shell 新窗口默认没有虚拟环境，因此无法运行：

```
uvicorn
demucs
```

所以做了 alias：

```bash
alias demucs="$HOME/demucs310/bin/demucs"
alias uvicorn="$HOME/demucs310/bin/uvicorn"
alias python310="$HOME/demucs310/bin/python"
alias pip310="$HOME/demucs310/bin/pip"
```

作用：

- 不污染系统 Python  
- 本地任意终端都能使用虚拟环境的工具  
- FastAPI、demucs、audio-separator 都可直接使用  

---

# 🧩 七、当前 Python 音频服务说明

服务文件结构：

```
ai-service/
  app.py               ← FastAPI 主入口（执行 demucs / audio-separator）
  config.py            ← 模型路径、默认配置
  audio_models/        ← Roformer / UVR 模型放这里
  data/
    input/
    output/
```

服务启动：

```
uvicorn app:app --host 0.0.0.0 --port 8001
```

---

# 🧩 八、当前音频分离方案（稳定可用）

## 1. 人声/伴奏分离（UVR / Roformer）
```
audio-separator test.flac --model_filename model_bs_roformer...ckpt
```

## 2. 4轨分离（htdemucs）
```
demucs -n htdemucs test.flac
```

## 3. 6轨分离（htdemucs_6s）
```
demucs -n htdemucs_6s test.flac
```

---

# 🧩 九、未来注意事项

- 不再使用 Docker  
- 不要在系统 Python 装 Demucs / audio-separator  
- 所有依赖保持在 demucs310 虚拟环境  
- 如果换新机器：**只需复制虚拟环境 + 模型文件 + ai-service 即可使用**  
- 如果模型升级，只改 `config.py` 即可

---

# 🧩 十、最终总结

你现在的环境结构是业界最稳定、最干净的方案：

- ❌ 不用 Docker  
- ❌ 不用多环境  
- ✔ 用一个虚拟环境跑全部分离任务  
- ✔ v4 版本统一  
- ✔ Java 后端可直接调用  
- ✔ alias 加强体验，不污染系统环境  
- ✔ 全部分离功能（2轨/4轨/6轨）完全可用

如需我继续为你生成 README、部署脚本、Java 调用示例、或生产部署方案，随时告诉我。

