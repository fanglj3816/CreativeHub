# Demucs 使用与部署说明文档

## 一、Mac 本地开发环境说明

### 1. 不要使用系统自带 Python

macOS 自带的 `/usr/bin/python3` 不允许安装第三方包（PEP 668），会报
`externally-managed-environment`。

### 2. 正确做法：使用 Homebrew Python + 虚拟环境

1.  安装 brew Python

    ``` bash
    brew install python
    ```

2.  创建虚拟环境

    ``` bash
    python3 -m venv ~/demucs310
    ```

3.  激活环境

    ``` bash
    source ~/demucs310/bin/activate
    ```

4.  安装依赖

    ``` bash
    pip install --upgrade pip
    pip install "numpy<2" soundfile demucs
    ```

5.  运行分离

    ``` bash
    demucs -n htdemucs test.flac
    demucs -n htdemucs_6s test.flac
    ```

### 3. 重启后要做什么？

每次重启只需要执行：

``` bash
source ~/demucs310/bin/activate
```

即可继续使用 `demucs` 命令。

------------------------------------------------------------------------

## 二、常见报错与解决方案

### 1. numpy 相关报错（Failed to initialize NumPy）

原因：numpy 2.x 与部分依赖不兼容\
解决：

``` bash
pip install "numpy<2"
```

### 2. TorchCodec / soundfile 报错

安装：

``` bash
brew install libsndfile
pip install soundfile
```

### 3. torchaudio 保存音频失败

确保使用 soundfile 后端，安装方式同上。

------------------------------------------------------------------------

## 三、Linux 部署说明（正式环境 / 服务器）

### 1. 安装依赖

``` bash
sudo apt update
sudo apt install -y python3 python3-venv ffmpeg libsndfile1
```

### 2. 创建虚拟环境

``` bash
python3 -m venv /opt/demucs_env
source /opt/demucs_env/bin/activate
pip install --upgrade pip
pip install "numpy<2" soundfile demucs
```

### 3. 测试

``` bash
demucs -n htdemucs test.flac
demucs -n htdemucs_6s test.flac
```

### 4. Java/Python 服务中调用方式

不要 import，建议直接调用命令行：

``` bash
/opt/demucs_env/bin/demucs -n htdemucs_6s /path/input.wav -o /path/output
```

------------------------------------------------------------------------

## 四、快速操作 CheatSheet

### 本地（Mac）

``` bash
source ~/demucs310/bin/activate
demucs -n htdemucs_6s test.flac
```

### Linux 部署

``` bash
source /opt/demucs_env/bin/activate
demucs -n htdemucs_6s input.wav
```

------------------------------------------------------------------------

## 五、总结

-   **不需要 Docker**，Demucs 本地运行即可完成所有分离任务。\
-   **只用 demucs 命令即可**，不需要 `python -m demucs.separate`。\
-   **推荐 6 stems：htdemucs_6s**，更细致但速度稍慢。\
-   通过虚拟环境确保 Python 依赖不干扰系统或业务服务。
