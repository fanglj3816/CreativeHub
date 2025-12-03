# config.py
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
