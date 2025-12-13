import React, { useState, useRef, useEffect } from 'react';
import { Button, Progress, message, Card, Select, Collapse } from 'antd';
import { DownloadOutlined, ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import AudioPlayer from '../../components/AudioPlayer';
import {
  separateVocal,
  separateDemucs4,
  separateDemucs6,
  getTaskStatus,
  type TrackInfo,
  type TaskStatusResponse,
} from '../../api/audio';
import { uploadMedia, type MediaDTO } from '../../api/media';
import './AudioSeparation.css';

const { Option } = Select;
const { Panel } = Collapse;

/**
 * AI 音频分离页面
 * 支持三种分离模式：
 * - 人声分离（vocal + instrumental）
 * - 4 轨分离（vocal / drums / bass / other）
 * - 6 轨分离（扩展多轨）
 */
const AudioSeparationPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [mediaDTO, setMediaDTO] = useState<MediaDTO | null>(null);
  const [mode, setMode] = useState<'vocal' | 'demucs4' | 'demucs6'>('vocal');
  const [outputFormat, setOutputFormat] = useState<'wav' | 'mp3'>('wav');
  const [modelName, setModelName] = useState<string>('Roformer (model_bs_roformer_ep_317_sdr_12.9755)');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmittingRef = useRef<boolean>(false); // 防止重复提交
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };


  // 处理文件上传
  const handleFileUpload = async (selectedFile: File) => {
    // 防止重复上传
    if (uploading) {
      return;
    }

    // 验证文件类型
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      message.error('请上传音频文件（MP3, WAV, FLAC）');
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    
    try {
      const media: MediaDTO = await uploadMedia(selectedFile);
      
      setFile(selectedFile);
      setMediaDTO(media);
      setTracks([]); // 清空之前的结果
      
      // 清空 input 的 value，防止重复触发
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      message.success('上传成功');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '上传失败，请重试';
      message.error(errorMessage);
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading) {
      return;
    }

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await handleFileUpload(droppedFile);
    }
  };

  // 处理点击上传区域
  const handleUploadAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 删除已上传的文件
  const handleDeleteFile = () => {
    setFile(null);
    setMediaDTO(null);
    setTracks([]);
    message.info('已清除文件，可以重新上传');
  };

  // 停止轮询
  const stopPolling = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // 开始轮询任务状态
  const startPolling = (currentTaskId: number) => {
    // 先清除之前的轮询
    stopPolling();

    // 立即查询一次
    pollTaskStatus(currentTaskId);

    // 每 1 秒轮询一次
    progressIntervalRef.current = setInterval(() => {
      pollTaskStatus(currentTaskId);
    }, 1000);
  };

  // 轮询任务状态
  const pollTaskStatus = async (currentTaskId: number) => {
    try {
      const statusResponse: TaskStatusResponse = await getTaskStatus(currentTaskId);
      
      // 更新进度
      setProgress(statusResponse.progress || 0);

      // 根据状态处理
      if (statusResponse.status === 'SUCCESS') {
        // 任务成功，停止轮询
        stopPolling();
        setLoading(false);
        isSubmittingRef.current = false;

        // 根据分离模式解析结果
        const resultTracks: TrackInfo[] = [];
        
        if (mode === 'vocal') {
          // 人声分离：vocalUrl 和 instUrl
          if (statusResponse.vocalUrl) {
            resultTracks.push({
              name: 'Vocal',
              url: statusResponse.vocalUrl,
              description: '人声',
            });
          }
          if (statusResponse.instUrl) {
            resultTracks.push({
              name: 'Instrumental',
              url: statusResponse.instUrl,
              description: '伴奏',
            });
          }
        } else if (mode === 'demucs4') {
          // 4 轨分离：trackUrls
          const trackNames = ['Vocal', 'Drums', 'Bass', 'Other'];
          const trackDescriptions = ['人声', '鼓', '贝斯', '其他'];
          if (statusResponse.trackUrls && statusResponse.trackUrls.length > 0) {
            statusResponse.trackUrls.forEach((url, index) => {
              resultTracks.push({
                name: trackNames[index] || `Track ${index + 1}`,
                url: url,
                description: trackDescriptions[index] || '',
              });
            });
          }
        } else if (mode === 'demucs6') {
          // 6 轨分离：trackUrls
          const trackNames = ['Vocal', 'Drums', 'Bass', 'Other', 'Piano', 'Guitar'];
          const trackDescriptions = ['人声', '鼓', '贝斯', '其他', '钢琴', '吉他'];
          if (statusResponse.trackUrls && statusResponse.trackUrls.length > 0) {
            statusResponse.trackUrls.forEach((url, index) => {
              resultTracks.push({
                name: trackNames[index] || `Track ${index + 1}`,
                url: url,
                description: trackDescriptions[index] || '',
              });
            });
          }
        }

        setTracks(resultTracks);
        message.success('分离完成！');
      } else if (statusResponse.status === 'FAILED') {
        // 任务失败，停止轮询
        stopPolling();
        setLoading(false);
        isSubmittingRef.current = false;
        message.error(statusResponse.errorMsg || '任务处理失败');
      }
      // PROCESSING 和 PENDING 状态继续轮询，只更新进度
    } catch (error: any) {
      console.error('查询任务状态失败:', error);
      // 网络错误时不停止轮询，继续尝试
      // 如果是 404 等严重错误，可以考虑停止轮询
      if (error.response?.status === 404) {
        stopPolling();
        setLoading(false);
        isSubmittingRef.current = false;
        message.error('任务不存在');
      }
    }
  };

  // 开始分离
  const handleStartSeparation = async () => {
    if (!mediaDTO || !mediaDTO.id) {
      message.warning('请先上传音频文件');
      return;
    }

    // 防止重复提交（使用 ref 确保原子性）
    if (isSubmittingRef.current || loading) {
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setProgress(0);
    setTracks([]);
    // 清除之前的轮询
    stopPolling();

    try {
      const mediaId = mediaDTO.id;
      let response;

      // 根据分离模式调用不同的接口
      if (mode === 'vocal') {
        response = await separateVocal(mediaId);
      } else if (mode === 'demucs4') {
        response = await separateDemucs4(mediaId);
      } else {
        response = await separateDemucs6(mediaId);
      }

      if (response.code === 0 && response.taskId) {
        message.success('任务已创建，正在处理中...');
        // 开始轮询任务状态
        startPolling(response.taskId);
      } else {
        message.error(response.message || '创建任务失败');
        setLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (error: any) {
      console.error('分离失败:', error);
      message.error(error.response?.data?.message || error.message || '创建任务失败，请重试');
      setLoading(false);
      isSubmittingRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  // 处理下载
  const handleDownload = (track: TrackInfo) => {
    if (!track.url) {
      message.info('暂未接入下载接口，请等待后端实现');
      return;
    }

    const link = document.createElement('a');
    link.href = track.url;
    link.download = `${track.name}.${outputFormat}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="audio-separation-page">
        {/* 头部 */}
        <div className="audio-separation-header">
          <Button
            className="back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          >
            返回
          </Button>
          <div className="header-content">
            <h1 className="page-title">AI 音频分离</h1>
            <p className="page-subtitle">一键提取人声、伴奏和多轨音频，制作你的专属作品</p>
          </div>
        </div>

        {/* 上传区域 */}
        <Card className="upload-section card-base">
          {!file ? (
            <div className="upload-area">
              <div
                className={`upload-drag-area ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadAreaClick}
              >
                <div className="upload-icon-wrapper">
                  <PlusOutlined className="upload-icon" />
                </div>
                <p className="upload-text">拖拽音频文件到此处，或点击选择文件</p>
                <p className="upload-hint">支持格式：MP3 / WAV / FLAC</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/x-flac,.mp3,.wav,.flac"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile && !uploading) {
                      handleFileUpload(selectedFile);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="uploaded-file-info">
              <div className="file-info-header">
                <h3 className="file-info-header-title">音频文件信息</h3>
              </div>
              <div className="file-info-content">
                <div className="file-info-item">
                  <span className="file-info-label">文件名：</span>
                  <span className="file-info-value">{file.name}</span>
                </div>
                <div className="file-info-item">
                  <span className="file-info-label">大小：</span>
                  <span className="file-info-value">{formatFileSize(file.size)}</span>
                </div>
                {mediaDTO && (
                  <div className="file-info-item">
                    <span className="file-info-label">上传状态：</span>
                    <span className="file-info-value">
                      {mediaDTO.status === 0 ? '已完成' : mediaDTO.status === 1 ? '处理中' : '失败'}
                    </span>
                  </div>
                )}
                <div className="file-info-item file-info-actions">
                  <Button
                    className="delete-btn"
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteFile}
                    type="text"
                    danger
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 模式选择区域 */}
        <Card className="mode-section card-base">
          <h3 className="section-title">分离方式选择</h3>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${mode === 'vocal' ? 'active' : ''}`}
              onClick={() => setMode('vocal')}
              disabled={loading}
            >
              <span className="mode-icon">🎤</span>
              <div className="mode-content">
                <div className="mode-name">人声分离</div>
                <div className="mode-desc">伴奏 + 人声</div>
              </div>
            </button>
            <button
              className={`mode-btn ${mode === 'demucs4' ? 'active' : ''}`}
              onClick={() => setMode('demucs4')}
              disabled={loading}
            >
              <span className="mode-icon">🥁</span>
              <div className="mode-content">
                <div className="mode-name">4 轨分离</div>
                <div className="mode-desc">人声 / 鼓 / 贝斯 / 其他</div>
              </div>
            </button>
            <button
              className={`mode-btn ${mode === 'demucs6' ? 'active' : ''}`}
              onClick={() => setMode('demucs6')}
              disabled={loading}
            >
              <span className="mode-icon">🎹</span>
              <div className="mode-content">
                <div className="mode-name">6 轨分离</div>
                <div className="mode-desc">扩展多轨</div>
              </div>
            </button>
          </div>
        </Card>

        {/* 高级选项 */}
        <Card className="options-section card-base">
          <Collapse ghost>
            <Panel header={<span className="options-header">高级选项（可选）</span>} key="1">
              <div className="options-content">
                {mode === 'vocal' && (
                  <div className="option-item">
                    <label className="option-label">模型选择</label>
                    <Select
                      value={modelName}
                      onChange={setModelName}
                      className="option-select"
                      disabled={loading}
                    >
                      <Option value="Roformer (model_bs_roformer_ep_317_sdr_12.9755)">
                        Roformer (model_bs_roformer_ep_317_sdr_12.9755)
                      </Option>
                      <Option value="UVR-MDX">UVR-MDX</Option>
                      <Option value="UVR-Karaoke">UVR-Karaoke</Option>
                    </Select>
                  </div>
                )}
                <div className="option-item">
                  <label className="option-label">输出格式</label>
                  <Select
                    value={outputFormat}
                    onChange={(value) => setOutputFormat(value)}
                    className="option-select"
                    disabled={loading}
                  >
                    <Option value="wav">WAV</Option>
                    <Option value="mp3">MP3</Option>
                  </Select>
                </div>
              </div>
            </Panel>
          </Collapse>
        </Card>

        {/* 操作按钮和进度 */}
        <div className="action-section">
                 <Button
                   type="primary"
                   size="large"
                   onClick={handleStartSeparation}
                   disabled={!mediaDTO || !mediaDTO.id || loading}
                   className="start-btn"
                   loading={loading}
                 >
                   {loading ? '处理中...' : '开始分离'}
                 </Button>
        </div>

        {loading && (
          <Card className="progress-section card-base">
            <div className="progress-content">
              <div className="progress-header">
                <h3 className="progress-title">处理进度</h3>
                <span className="progress-percent">{Math.round(progress)}%</span>
              </div>
              <Progress
                percent={progress}
                status="active"
                strokeColor={{
                  '0%': '#00d4ff',
                  '100%': '#0099cc',
                }}
                className="progress-bar"
              />
            </div>
          </Card>
        )}

        {/* 分离结果区域 */}
        {tracks.length > 0 && (
          <div className="results-section">
            <h3 className="results-title">分离结果</h3>
            <div className="results-grid">
              {tracks.map((track, index) => (
                <Card key={index} className="result-card card-base">
                  <div className="result-card-header">
                    <h4 className="result-card-title">{track.name}</h4>
                    {track.description && (
                      <p className="result-card-desc">{track.description}</p>
                    )}
                  </div>
                  <div className="result-card-content">
                    {track.url ? (
                      <AudioPlayer url={track.url} fileName={track.name} />
                    ) : (
                      <div className="audio-placeholder">
                        <p className="placeholder-text">音频文件暂未生成</p>
                      </div>
                    )}
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(track)}
                      className="download-btn"
                    >
                      下载
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AudioSeparationPage;

