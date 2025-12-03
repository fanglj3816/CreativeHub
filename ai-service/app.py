# app.py

import os
import uuid
import shutil
import subprocess
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

import config  # 必须有 config.AUDIO_SEPARATOR_CMD / config.DEMUCS_CMD 等

app = FastAPI(title="CreativeHub Audio AI Service")


# ---------------------------------------------------------
# 创建目录
# ---------------------------------------------------------
def ensure_dirs():
    for d in [config.INPUT_BASE_DIR, config.OUTPUT_BASE_DIR, config.AUDIO_MODELS_DIR]:
        Path(d).mkdir(parents=True, exist_ok=True)


ensure_dirs()


# ---------------------------------------------------------
# 保存上传文件
# ---------------------------------------------------------
def save_upload_file(upload_file: UploadFile, job_id: str) -> Path:
    """将上传的音频保存到 input 目录"""
    filename = f"{job_id}_{upload_file.filename}"
    dest = Path(config.INPUT_BASE_DIR) / filename

    with dest.open("wb") as f:
        shutil.copyfileobj(upload_file.file, f)

    return dest


# ---------------------------------------------------------
# 人声分离（audio-separator / Roformer）
# ---------------------------------------------------------
@app.post("/separate/vocal")
async def separate_vocal(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())

    # 1. 保存音频
    input_path = save_upload_file(file, job_id)

    # 2. 输出目录
    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # 3. 绝对路径 audio-separator
    cmd = [
        config.AUDIO_SEPARATOR_CMD,    # ← ★ 使用绝对路径
        str(input_path),
        "--model_file_dir", str(config.AUDIO_MODELS_DIR),
        "--model_filename", config.UVR_MODEL_FILENAME,
        "--output_dir", str(output_dir),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    return JSONResponse({
        "job_id": job_id,
        "input_file": str(input_path),
        "output_dir": str(output_dir),
        "stdout": result.stdout,
        "stderr": result.stderr,
    })


# ---------------------------------------------------------
# 4轨分离
# ---------------------------------------------------------
@app.post("/separate/demucs4")
async def separate_demucs4(file: UploadFile = File(...)):
    return await _run_demucs(file, config.DEMUCS_MODEL_4)


# ---------------------------------------------------------
# 6轨分离
# ---------------------------------------------------------
@app.post("/separate/demucs6")
async def separate_demucs6(file: UploadFile = File(...)):
    return await _run_demucs(file, config.DEMUCS_MODEL_6)


# ---------------------------------------------------------
# Demucs 分离通用函数
# ---------------------------------------------------------
async def _run_demucs(file: UploadFile, model_name: str):
    job_id = str(uuid.uuid4())

    input_path = save_upload_file(file, job_id)

    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # 使用绝对路径 demucs
    cmd = [
        config.DEMUCS_CMD,    # ← ★ 使用绝对路径
        "-n", model_name,
        str(input_path),
        "-o", str(output_dir),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    return JSONResponse({
        "job_id": job_id,
        "model": model_name,
        "input_file": str(input_path),
        "output_dir": str(output_dir),
        "stdout": result.stdout,
        "stderr": result.stderr,
    })
