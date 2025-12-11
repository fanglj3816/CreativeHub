# config.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# -------------------------
# 目录
# -------------------------
INPUT_BASE_DIR = BASE_DIR / "data" / "input"
OUTPUT_BASE_DIR = BASE_DIR / "data" / "output"
AUDIO_MODELS_DIR = BASE_DIR / "audio_models"

# -------------------------
# 模型文件名
# -------------------------
UVR_MODEL_FILENAME = "model_bs_roformer_ep_317_sdr_12.9755.ckpt"

# -------------------------
# 命令绝对路径（关键）
# -------------------------
BIN_DIR = "/Users/fangliangjun/demucs310/bin"

AUDIO_SEPARATOR_CMD = f"{BIN_DIR}/audio-separator"
DEMUCS_CMD = f"{BIN_DIR}/demucs"

# Demucs 模型名
DEMUCS_MODEL_4 = "htdemucs"      # 4轨
DEMUCS_MODEL_6 = "htdemucs_6s"   # 6轨

# -------------------------
# MinIO 配置
# -------------------------
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "creativehub")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "CreativeHub@123")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "creativehub-media")

# -------------------------
# Java 服务回调配置
# 注意：应该通过 Gateway 访问，而不是直接访问 Java 服务
# Gateway 端口：8000
# -------------------------
JAVA_SERVICE_BASE_URL = os.getenv("JAVA_SERVICE_BASE_URL", "http://localhost:8000")
JAVA_BACKEND_BASE_URL = os.getenv("JAVA_BACKEND_BASE_URL", "http://localhost:8000")
