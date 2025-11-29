# FFmpeg 安装指南

## 概述

media-service 需要 FFmpeg 和 FFprobe 来执行视频转码和获取媒体元数据。

## Mac 安装

### 使用 Homebrew（推荐）

```bash
brew install ffmpeg
```

### 验证安装

```bash
ffmpeg -version
ffprobe -version
```

## Windows 安装

### 方法 1：使用 Chocolatey

```bash
choco install ffmpeg
```

### 方法 2：手动安装

1. 访问 [FFmpeg 官网](https://ffmpeg.org/download.html)
2. 下载 Windows 版本（推荐使用 gyan.dev 的构建版本）
3. 解压到目录，例如：`C:\ffmpeg`
4. 将 `C:\ffmpeg\bin` 添加到系统 PATH 环境变量
5. 重启命令行或 IDE

### 验证安装

```cmd
ffmpeg -version
ffprobe -version
```

## Linux 安装

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install ffmpeg
```

### CentOS/RHEL

```bash
sudo yum install epel-release
sudo yum install ffmpeg
```

## 功能说明

- **FFmpeg**: 用于视频转码（MOV → MP4）
- **FFprobe**: 用于获取视频元数据（宽高、时长）

如果 FFmpeg 不可用，视频转码功能将无法使用，但其他功能（图片、音频上传）不受影响。

## 转码格式支持

### 需要转码的格式
- MOV
- MKV
- AVI
- HEVC
- FLV
- WMV
- M4V
- 3GP

### 无需转码的格式（直接上传）
- MP4 (H.264 + AAC)

### 音频格式
- 音频文件（包括 FLAC）不做转码，保持原始格式

