import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Upload, Select, Progress, message, Card } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import MainLayout from '../../layouts/MainLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { createVocalTask, getTaskDetail, parseTaskResult, type TaskStatus, type VocalResult } from '../../api/audio';
import { uploadMedia } from '../../api/media';
import './VocalSeparation.css';

const { Option } = Select;

interface UploadedFile {
  fileId: number;
  fileName: string;
  fileSize: number;
  url?: string;
}

const VocalSeparation: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [model, setModel] = useState<'UVR-MDX' | 'UVR-Karaoke'>('UVR-MDX');
  const [outputFormat, setOutputFormat] = useState<'WAV' | 'FLAC'>('WAV');
  const [taskId, setTaskId] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VocalResult | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    // 验证文件类型
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      message.error('请上传音频文件（mp3, wav, flac）');
      return false;
    }

    try {
      message.loading({ content: '正在上传文件...', key: 'upload' });
      const mediaDTO = await uploadMedia(file);
      
      setUploadedFile({
        fileId: mediaDTO.id,
        fileName: file.name,
        fileSize: file.size,
        url: mediaDTO.url || undefined,
      });

      message.success({ content: '上传成功', key: 'upload' });
    } catch (error: any) {
      message.error({ content: error.response?.data?.message || '上传失败，请重试', key: 'upload' });
    }

    return false; // 阻止默认上传行为
  };

  // 开始分离任务
  const handleStartSeparation = async () => {
    if (!uploadedFile) {
      message.warning('请先上传音频文件');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await createVocalTask({
        fileId: uploadedFile.fileId,
        options: {
          model,
          outputFormat,
        },
      });

      if (response.code === 0 && response.data.taskId) {
        setTaskId(response.data.taskId);
        startPolling(response.data.taskId);
        message.success('任务已创建，开始处理...');
      } else {
        message.error(response.message || '创建任务失败');
        setIsProcessing(false);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建任务失败，请重试');
      setIsProcessing(false);
    }
  };

  // 开始轮询任务状态
  const startPolling = (id: number) => {
    // 立即查询一次
    fetchTaskStatus(id);

    // 每2秒轮询一次
    pollingIntervalRef.current = setInterval(() => {
      fetchTaskStatus(id);
    }, 2000);
  };

  // 获取任务状态
  const fetchTaskStatus = async (id: number) => {
    try {
      const response = await getTaskDetail(id);
      if (response.code === 0 && response.data) {
        const status = response.data.data;
        setTaskStatus(status);

        // 如果任务完成或失败，停止轮询
        if (status.status === 2) {
          // 成功
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsProcessing(false);
          const parsedResult = parseTaskResult(status.resultJson);
          setResult(parsedResult);
          message.success('处理完成！');
        } else if (status.status === 3) {
          // 失败
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsProcessing(false);
          message.error(status.errorMessage || '处理失败');
        }
      }
    } catch (error: any) {
      console.error('获取任务状态失败:', error);
      // 不显示错误消息，避免频繁弹窗
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 获取状态文本
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return '等待中';
      case 1:
        return '处理中';
      case 2:
        return '已完成';
      case 3:
        return '失败';
      default:
        return '未知';
    }
  };

  // 构建文件下载URL（假设后端返回的是相对路径，需要拼接baseURL）
  const getFileUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // 如果后端返回的是MinIO路径，可能需要通过媒体服务访问
    // 这里先假设直接返回完整URL，如果不对需要根据实际情况调整
    return path;
  };

  // 处理文件下载
  const handleDownload = (url: string, filename: string) => {
    const fileUrl = getFileUrl(url);
    // 创建一个临时的 a 标签来触发下载
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="vocal-separation-page">
        {/* 头部 */}
        <div className="vocal-separation-header">
          <Button
            className="back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          >
            返回
          </Button>
          <div className="header-content">
            <h1 className="page-title">AI 人声分离</h1>
            <p className="page-subtitle">一键提取人声与伴奏，制作你的专属翻唱与伴奏。</p>
          </div>
        </div>

        {/* 上传区域 */}
        <Card className="upload-section card-base">
          <div className="upload-area">
            <Upload
              accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/x-flac,.mp3,.wav,.flac"
              showUploadList={false}
              beforeUpload={handleFileUpload}
              className="upload-component"
            >
              <div className="upload-drag-area">
                <UploadOutlined className="upload-icon" />
                <p className="upload-text">拖拽音频文件到此处，或点击选择文件</p>
                <p className="upload-hint">支持格式：MP3, WAV, FLAC</p>
              </div>
            </Upload>
          </div>

          {uploadedFile && (
            <div className="uploaded-file-info">
              <div className="file-info-item">
                <span className="file-info-label">文件名：</span>
                <span className="file-info-value">{uploadedFile.fileName}</span>
              </div>
              <div className="file-info-item">
                <span className="file-info-label">大小：</span>
                <span className="file-info-value">{formatFileSize(uploadedFile.fileSize)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* 参数区域 */}
        <Card className="params-section card-base">
          <div className="params-content">
            <div className="params-description">
              <h3 className="params-title">人声分离</h3>
              <p className="params-desc">使用AI技术将音频中的人声和伴奏分离，生成独立的音轨文件。</p>
            </div>
            <div className="params-controls">
              <div className="param-item">
                <label className="param-label">模型选择</label>
                <Select
                  value={model}
                  onChange={(value) => setModel(value)}
                  className="param-select"
                  disabled={isProcessing || !!taskId}
                >
                  <Option value="UVR-MDX">UVR-MDX</Option>
                  <Option value="UVR-Karaoke">UVR-Karaoke</Option>
                </Select>
              </div>
              <div className="param-item">
                <label className="param-label">输出格式</label>
                <Select
                  value={outputFormat}
                  onChange={(value) => setOutputFormat(value)}
                  className="param-select"
                  disabled={isProcessing || !!taskId}
                >
                  <Option value="WAV">WAV</Option>
                  <Option value="FLAC">FLAC</Option>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* 开始分离按钮 */}
        {!taskId && (
          <div className="action-section">
            <Button
              type="primary"
              size="large"
              onClick={handleStartSeparation}
              disabled={!uploadedFile || isProcessing}
              className="start-btn"
            >
              开始分离
            </Button>
          </div>
        )}

        {/* 任务进度 */}
        {taskId && taskStatus && (
          <Card className="progress-section card-base">
            <div className="progress-content">
              <div className="progress-header">
                <h3 className="progress-title">处理进度</h3>
                <span className={`status-badge status-${taskStatus.status}`}>
                  {getStatusText(taskStatus.status)}
                </span>
              </div>
              <Progress
                percent={taskStatus.progress}
                status={taskStatus.status === 3 ? 'exception' : 'active'}
                strokeColor={{
                  '0%': '#00d4ff',
                  '100%': '#0099cc',
                }}
                className="progress-bar"
              />
              {taskStatus.errorMessage && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{taskStatus.errorMessage}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 结果展示 */}
        {result && (
          <div className="results-section">
            <h3 className="results-title">处理结果</h3>
            <div className="results-grid">
              {/* 人声轨道 */}
              <Card className="result-card card-base">
                <div className="result-card-header">
                  <h4 className="result-card-title">人声</h4>
                </div>
                <div className="result-card-content">
                  <AudioPlayer url={getFileUrl(result.vocal)} fileName="人声" />
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(result.vocal, 'vocal.' + outputFormat.toLowerCase())}
                    className="download-btn"
                  >
                    下载
                  </Button>
                </div>
              </Card>

              {/* 伴奏轨道 */}
              <Card className="result-card card-base">
                <div className="result-card-header">
                  <h4 className="result-card-title">伴奏</h4>
                </div>
                <div className="result-card-content">
                  <AudioPlayer url={getFileUrl(result.instrumental)} fileName="伴奏" />
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(result.instrumental, 'instrumental.' + outputFormat.toLowerCase())}
                    className="download-btn"
                  >
                    下载
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VocalSeparation;

