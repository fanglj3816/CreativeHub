# app.py
"""
CreativeHub Audio AI Service

重构版：
- 移除了 RabbitMQ 消费逻辑，不再在 Python 侧订阅 MQ。
- 提供 HTTP 接口给 Java 调用：根据 MinIO 上的文件 URL 做人声/多轨分离，
  上传结果回 MinIO，并返回结果 URL 列表（以及尽量猜测 vocal / inst）。
- 保留原来的基于 UploadFile 的 /separate/vocal /separate/demucs4 /separate/demucs6
  端点，主要用于手工调试。
"""

import os
import uuid
import shutil
import subprocess
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from minio import Minio
from minio.error import S3Error
from pydantic import BaseModel

import config  # 必须提供 AUDIO_SEPARATOR_CMD / DEMUCS_CMD / UVR_MODEL_FILENAME 等

logger = logging.getLogger(__name__)

app = FastAPI(title="CreativeHub Audio AI Service")


# ---------------------------------------------------------
# 目录初始化
# ---------------------------------------------------------
def ensure_dirs() -> None:
    for d in [config.INPUT_BASE_DIR, config.OUTPUT_BASE_DIR, config.AUDIO_MODELS_DIR]:
        Path(d).mkdir(parents=True, exist_ok=True)


ensure_dirs()


# ---------------------------------------------------------
# Pydantic 模型：Java 调用用
# ---------------------------------------------------------
class SeparationRequest(BaseModel):
    """
    Java 调用 Python 分离接口的请求体。

    - taskId: Java 侧的任务 ID，仅用于日志关联，可选
    - fileUrl: MinIO 上可直接访问的音频 URL（HTTP 地址）
    - fileName: 可选文件名，如果不传会从 URL 中猜
    """
    taskId: Optional[int] = None
    fileUrl: str
    fileName: Optional[str] = None


class StemResult(BaseModel):
    stem: str
    url: str


class SeparationResponse(BaseModel):
    taskId: Optional[int] = None
    jobId: str
    results: List[StemResult]
    vocalUrl: Optional[str] = None
    instUrl: Optional[str] = None


# ---------------------------------------------------------
# 辅助函数：进度更新
# ---------------------------------------------------------
def update_task_progress(task_id: Optional[int], progress: int, message: Optional[str] = None) -> None:
    """
    调用 Java 内部接口更新任务进度。失败只打日志，不抛异常。
    
    Args:
        task_id: Java 侧的任务 ID
        progress: 进度值 (0-100)
        message: 可选的描述信息
    """
    if not task_id:
        return

    try:
        url = f"{config.JAVA_BACKEND_BASE_URL}/internal/audio/task/{task_id}/progress"
        payload = {"progress": progress}
        if message:
            payload["message"] = message
        
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
        logger.debug("Updated task progress: taskId=%s, progress=%s, message=%s", 
                    task_id, progress, message)
    except Exception as e:
        logger.warning(
            "Failed to update task progress: taskId=%s, progress=%s, error=%s",
            task_id, progress, e
        )


# ---------------------------------------------------------
# 辅助函数：下载、分离、上传
# ---------------------------------------------------------
def _download_audio_file(file_url: str, file_name: Optional[str], job_id: str) -> Path:
    """从 URL 下载音频文件到本地 INPUT 目录。"""
    if not file_name:
        # 尝试从 URL 中截取文件名
        file_name = file_url.rstrip("/").split("/")[-1] or f"{job_id}.audio"

    dest = Path(config.INPUT_BASE_DIR) / f"{job_id}_{file_name}"
    dest.parent.mkdir(parents=True, exist_ok=True)

    logger.info("Downloading audio file: url=%s -> %s", file_url, dest)
    response = requests.get(file_url, stream=True, timeout=300)  # 5 分钟超时
    response.raise_for_status()

    with dest.open("wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    logger.info("Downloaded audio file: %s (size: %d bytes)", dest, dest.stat().st_size)
    return dest


def _run_vocal_separation(input_path: Path, output_dir: Path) -> None:
    """调用 audio-separator / UVR 进行人声/伴奏 2 轨分离。"""
    cmd = [
        config.AUDIO_SEPARATOR_CMD,
        str(input_path),
        "--model_file_dir",
        str(config.AUDIO_MODELS_DIR),
        "--model_filename",
        config.UVR_MODEL_FILENAME,
        "--output_dir",
        str(output_dir),
    ]
    logger.info("Running vocal separation cmd: %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error(
            "Vocal separation failed, code=%s, stderr=%s",
            result.returncode,
            result.stderr,
        )
        raise RuntimeError(f"Vocal separation failed: {result.stderr}")


def _run_demucs_separation(input_path: Path, output_dir: Path, model_name: str) -> None:
    """调用 Demucs 进行 4/6 轨分离。"""
    cmd = [
        config.DEMUCS_CMD,
        "-n",
        model_name,
        "--flac",
        str(input_path),
        "-o",
        str(output_dir),
    ]
    logger.info("Running demucs cmd: %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error(
            "Demucs separation failed, code=%s, stderr=%s",
            result.returncode,
            result.stderr,
        )
        raise RuntimeError(f"Demucs separation failed: {result.stderr}")


def _build_minio_client() -> Minio:
    """构建 MinIO 客户端。"""
    endpoint = config.MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
    is_secure = config.MINIO_ENDPOINT.startswith("https://")

    return Minio(
        endpoint=endpoint,
        access_key=config.MINIO_ACCESS_KEY,
        secret_key=config.MINIO_SECRET_KEY,
        secure=is_secure,
    )


def _upload_results_to_minio(output_dir: Path, job_id: str) -> List[str]:
    """
    将分离结果目录中的所有文件上传到 MinIO。

    返回可直接访问的完整 URL 列表：
        MINIO_ENDPOINT / bucket / object_name
    """
    client = _build_minio_client()
    result_urls: List[str] = []

    # 约定一个前缀路径：audio/separation/{job_id}/xxx.wav
    prefix = f"audio/separation/{job_id}/"

    for path in output_dir.rglob("*"):
        if not path.is_file():
            continue

        object_name = prefix + path.name
        try:
            logger.info("Uploading result file to MinIO: %s -> %s", path, object_name)
            client.fput_object(
                bucket_name=config.MINIO_BUCKET,
                object_name=object_name,
                file_path=str(path),
            )
        except S3Error as exc:
            logger.error("Failed to upload %s to MinIO: %s", path, exc)
            continue

        # 构造对外访问 URL
        endpoint = config.MINIO_ENDPOINT.rstrip("/")
        url = f"{endpoint}/{config.MINIO_BUCKET}/{object_name}"
        result_urls.append(url)

    return result_urls


def _cleanup_local_files(input_path: Path, output_dir: Path, job_id: str) -> None:
    """删除本次任务的本地输入文件和输出目录（jobId 目录）。"""
    # 删除下载的原始音频文件
    try:
        if input_path.exists():
            input_path.unlink()
            logger.info("Deleted local input file for job %s: %s", job_id, input_path)
    except Exception as exc:
        logger.warning("Failed to delete input file for job %s: %s", job_id, exc)

    # 删除 4/6 轨分离的输出目录（以 jobId 命名）
    try:
        if output_dir.exists():
            shutil.rmtree(output_dir)
            logger.info("Deleted local output dir for job %s: %s", job_id, output_dir)
    except Exception as exc:
        logger.warning("Failed to delete output dir for job %s: %s", job_id, exc)


def _guess_stem_from_name(name: str) -> str:
    """根据文件名猜测属于哪个 stem（vocals/drums/bass/other/instrumental/unknown）。"""
    lower = name.lower()
    if "vocal" in lower:
        return "vocals"
    if "inst" in lower or "instrumental" in lower or "accompaniment" in lower:
        return "instrumental"
    if "drum" in lower:
        return "drums"
    if "bass" in lower:
        return "bass"
    if "other" in lower:
        return "other"
    return "unknown"


def _guess_vocal_and_inst(result_urls: List[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    尝试从结果 URL 列表中猜测人声轨和伴奏轨。
    - 优先根据文件名包含 vocal / inst / instrumental / accompaniment 等关键字判断。
    - 如果没有明显标记，则对 2 轨输出：按文件名排序，第一个当 vocal，第二个当 inst。
    """
    vocal_url: Optional[str] = None
    inst_url: Optional[str] = None

    for url in result_urls:
        name = url.rstrip("/").split("/")[-1].lower()
        if vocal_url is None and "vocal" in name:
            vocal_url = url
        if inst_url is None and (
            "inst" in name or "instrumental" in name or "accompaniment" in name or "no_vocals" in name
        ):
            inst_url = url

    if vocal_url is None or inst_url is None:
        # 兜底逻辑：如果只有两条结果，按排序猜
        if len(result_urls) >= 2:
            sorted_urls = sorted(result_urls)
            if vocal_url is None:
                vocal_url = sorted_urls[0]
            if inst_url is None:
                inst_url = sorted_urls[1]
        elif len(result_urls) == 1:
            if vocal_url is None:
                vocal_url = result_urls[0]

    return vocal_url, inst_url


def _build_separation_response(
    req: SeparationRequest,
    job_id: str,
    result_urls: List[str],
) -> SeparationResponse:
    """根据结果 URL 列表构建标准响应。"""
    results: List[StemResult] = []
    for url in result_urls:
        name = url.rstrip("/").split("/")[-1]
        stem = _guess_stem_from_name(name)
        results.append(StemResult(stem=stem, url=url))

    vocal_url, inst_url = _guess_vocal_and_inst(result_urls)

    return SeparationResponse(
        taskId=req.taskId,
        jobId=job_id,
        results=results,
        vocalUrl=vocal_url,
        instUrl=inst_url,
    )


# ---------------------------------------------------------
# Java 调用的 HTTP 接口：基于 MinIO URL 做分离
# ---------------------------------------------------------
@app.post("/internal/separation/vocal", response_model=SeparationResponse)
async def separate_vocal_from_url(req: SeparationRequest) -> SeparationResponse:
    """
    Java 调用的人声/伴奏 2 轨分离接口。

    - 根据 req.fileUrl 从 MinIO 下载音频到本地
    - 调用 audio-separator 做 2 轨分离
    - 将结果上传回 MinIO
    - 返回所有结果 URL，并尽量标出 vocalUrl / instUrl
    """
    task_id = req.taskId
    job_id = str(task_id or uuid.uuid4())
    
    # 下载音频文件
    input_path = _download_audio_file(req.fileUrl, req.fileName, job_id)
    # 下载完成，更新进度到 20%
    update_task_progress(task_id, 20, "download finished")

    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # 即将开始分离，更新进度到 30%
    update_task_progress(task_id, 30, "separation started")
    _run_vocal_separation(input_path, output_dir)
    # 分离完成，更新进度到 90%
    update_task_progress(task_id, 90, "separation finished")

    result_urls = _upload_results_to_minio(output_dir, job_id)
    # 上传完成，更新进度到 95%
    update_task_progress(task_id, 95, "upload finished")
    
    # 清理本次任务在本地的文件
    _cleanup_local_files(input_path, output_dir, job_id)

    logger.info("Vocal separation finished: jobId=%s, results=%d", job_id, len(result_urls))

    return _build_separation_response(req, job_id, result_urls)


@app.post("/internal/separation/demucs4", response_model=SeparationResponse)
async def separate_demucs4_from_url(req: SeparationRequest) -> SeparationResponse:
    """
    Java 调用的 4 轨分离接口（Demucs 模型）。
    """
    task_id = req.taskId
    job_id = str(task_id or uuid.uuid4())
    
    # 下载音频文件
    input_path = _download_audio_file(req.fileUrl, req.fileName, job_id)
    # 下载完成，更新进度到 20%
    update_task_progress(task_id, 20, "download finished")

    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # 即将开始分离，更新进度到 30%
    update_task_progress(task_id, 30, "separation started")
    _run_demucs_separation(input_path, output_dir, config.DEMUCS_MODEL_4)
    # 分离完成，更新进度到 90%
    update_task_progress(task_id, 90, "separation finished")

    result_urls = _upload_results_to_minio(output_dir, job_id)
    # 上传完成，更新进度到 95%
    update_task_progress(task_id, 95, "upload finished")
    
    # 清理本次任务在本地的文件
    _cleanup_local_files(input_path, output_dir, job_id)

    logger.info("Demucs4 separation finished: jobId=%s, results=%d", job_id, len(result_urls))

    return _build_separation_response(req, job_id, result_urls)


@app.post("/internal/separation/demucs6", response_model=SeparationResponse)
async def separate_demucs6_from_url(req: SeparationRequest) -> SeparationResponse:
    """
    Java 调用的 6 轨分离接口（Demucs 模型）。
    """
    task_id = req.taskId
    job_id = str(task_id or uuid.uuid4())
    
    # 下载音频文件
    input_path = _download_audio_file(req.fileUrl, req.fileName, job_id)
    # 下载完成，更新进度到 20%
    update_task_progress(task_id, 20, "download finished")

    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # 即将开始分离，更新进度到 30%
    update_task_progress(task_id, 30, "separation started")
    _run_demucs_separation(input_path, output_dir, config.DEMUCS_MODEL_6)
    # 分离完成，更新进度到 90%
    update_task_progress(task_id, 90, "separation finished")

    result_urls = _upload_results_to_minio(output_dir, job_id)
    # 上传完成，更新进度到 95%
    update_task_progress(task_id, 95, "upload finished")
    
    # 清理本次任务在本地的文件
    _cleanup_local_files(input_path, output_dir, job_id)

    logger.info("Demucs6 separation finished: jobId=%s, results=%d", job_id, len(result_urls))

    return _build_separation_response(req, job_id, result_urls)


# ---------------------------------------------------------
# 原有的基于 UploadFile 的接口：可用于手工调试
# ---------------------------------------------------------
def save_upload_file(upload_file: UploadFile, job_id: str) -> Path:
    """将上传的音频保存到 input 目录"""
    filename = f"{job_id}_{upload_file.filename}"
    dest = Path(config.INPUT_BASE_DIR) / filename

    with dest.open("wb") as f:
        shutil.copyfileobj(upload_file.file, f)

    return dest


@app.post("/separate/vocal")
async def separate_vocal_upload(file: UploadFile = File(...)):
    """
    直接上传文件做人声分离的调试接口（不走 MinIO，不关联 Java 任务）。
    """
    job_id = str(uuid.uuid4())

    # 1. 保存音频
    input_path = save_upload_file(file, job_id)

    # 2. 输出目录
    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    _run_vocal_separation(input_path, output_dir)

    return JSONResponse({
        "job_id": job_id,
        "input_file": str(input_path),
        "output_dir": str(output_dir),
    })


async def _run_demucs_upload(file: UploadFile, model_name: str):
    job_id = str(uuid.uuid4())

    input_path = save_upload_file(file, job_id)

    output_dir = Path(config.OUTPUT_BASE_DIR) / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    _run_demucs_separation(input_path, output_dir, model_name)

    return JSONResponse({
        "job_id": job_id,
        "model": model_name,
        "input_file": str(input_path),
        "output_dir": str(output_dir),
    })


@app.post("/separate/demucs4")
async def separate_demucs4_upload(file: UploadFile = File(...)):
    """直接上传文件做 4 轨分离的调试接口。"""
    return await _run_demucs_upload(file, config.DEMUCS_MODEL_4)


@app.post("/separate/demucs6")
async def separate_demucs6_upload(file: UploadFile = File(...)):
    """直接上传文件做 6 轨分离的调试接口。"""
    return await _run_demucs_upload(file, config.DEMUCS_MODEL_6)
