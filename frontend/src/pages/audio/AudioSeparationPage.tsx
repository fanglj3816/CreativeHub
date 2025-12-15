import React, { useState, useRef, useEffect } from 'react';
import { Button, Progress, message, Select, Input, Badge, App, Tag } from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  BellOutlined,
} from '@ant-design/icons';
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
import '../HomeFeed.css';

const { Option } = Select;

/**
 * AI 音频分离页面
 * 支持三种分离模式：
 * - 人声分离（vocal + instrumental）
 * - 4 轨分离（vocal / drums / bass / other）
 * - 6 轨分离（扩展多轨）
 */
const AudioSeparationPage: React.FC = () => {
  const navigate = useNavigate();
  const { message: appMessage } = App.useApp();
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmittingRef = useRef<boolean>(false); // 防止重复提交
  const fileInputRef = useRef<HTMLInputElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // useEffect(() => {
  //   const ref =
  //     step === 1 ? step1Ref : step === 2 ? step2Ref : step3Ref;
  //   ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // }, [step]);

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
    setProgress(0);
    message.info('已清除文件，可以重新上传');
    setStep(1);
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

  const hasFile = Boolean(file && mediaDTO?.id);

  return (
    <MainLayout className="service-main-layout" hideLeftPanel hideRightPanel>
      <div className="feed-toolbar-wrapper tool-toolbar-wrapper">
        <div className="feed-toolbar">
          <div className="feed-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="logo-text">CreativeHub</span>
          </div>

          <div className="feed-toolbar-right">
            <div className="feed-toolbar-center">
              <div className="feed-top-actions">
                <button className="top-action-btn" onClick={() => navigate('/feed')}>
                  <ThunderboltOutlined /> <span>Feed</span>
                </button>
                <button className="top-action-btn active" onClick={() => navigate('/service')}>
                  <CustomerServiceOutlined /> <span>Services</span>
                </button>
                <button className="top-action-btn" onClick={() => navigate('/media')}>
                  <VideoCameraOutlined /> <span>Library</span>
                </button>
              </div>

              <Input
                className="feed-search"
                style={{ maxWidth: 480 }}
                placeholder="搜索作品、用户…"
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={() => appMessage.info('搜索功能稍后接入')}
              />
            </div>

            <div className="feed-toolbar-actions" aria-label="toolbar actions">
              <button className="toolbar-icon-btn" type="button" aria-label="通知">
                <Badge count={11} size="small" offset={[-2, 2]}>
                  <BellOutlined />
                </Badge>
              </button>

              <button className="toolbar-pill-btn" type="button" onClick={() => navigate('/ai-tools')} aria-label="Get">
                Get
              </button>

              <button className="toolbar-avatar-btn" type="button" aria-label="个人中心">
                <span className="toolbar-avatar">FF</span>
              </button>

              <button className="toolbar-primary-btn" type="button" onClick={() => navigate('/create-post')}>
                <PlusOutlined />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="service-page">
        <div className="service-layout">
          <aside className="service-left">
            <div className="card-base tool-nav-card">
              <div className="tool-nav-header">
                <div className="tool-nav-title">AI 工具箱</div>
                <div className="tool-nav-subtitle">选择你想使用的工具</div>
              </div>
              <div className="tool-nav-list">
                <button className="tool-nav-item active" type="button">
                  <span className="tool-nav-item-icon">🎛️</span>
                  <span className="tool-nav-item-text">音频分离</span>
                </button>
                <button className="tool-nav-item" type="button" onClick={() => appMessage.info('敬请期待')}>
                  <span className="tool-nav-item-icon">🎤</span>
                  <span className="tool-nav-item-text">
                    AI 翻唱 <Tag className="tool-nav-tag">敬请期待</Tag>
                  </span>
                </button>
                <button className="tool-nav-item" type="button" onClick={() => appMessage.info('规划中')}>
                  <span className="tool-nav-item-icon">🖼️</span>
                  <span className="tool-nav-item-text">
                    封面生成 <Tag className="tool-nav-tag">规划中</Tag>
                  </span>
                </button>
                <button className="tool-nav-item" type="button" onClick={() => appMessage.info('规划中')}>
                  <span className="tool-nav-item-icon">🎬</span>
                  <span className="tool-nav-item-text">
                    图+音乐短视频 <Tag className="tool-nav-tag">规划中</Tag>
                  </span>
                </button>
              </div>
            </div>

            <div className="card-base side-card">
              <div className="side-card__title">最近处理的音频</div>
              <div className="side-card__list">
                <div className="recent-item">
                  <div className="recent-name">{file?.name || 'demo_song.flac'}</div>
                  <Tag className="recent-tag" color={loading ? 'processing' : tracks.length > 0 ? 'success' : 'default'}>
                    {loading ? '处理中' : tracks.length > 0 ? '已完成' : '待开始'}
                  </Tag>
                </div>
                <div className="recent-item">
                  <div className="recent-name">lofi.wav</div>
                  <Tag className="recent-tag" color="processing">
                    处理中
                  </Tag>
                </div>
                <div className="recent-item">
                  <div className="recent-name">vocal_take.mp3</div>
                  <Tag className="recent-tag" color="success">
                    已完成
                  </Tag>
                </div>
              </div>
            </div>
          </aside>

          <main className="service-center">
            <div className="service-header">
              <h1 className="page-title">AI 音频分离</h1>
              <p className="page-subtitle">上传音频 → 选择分离方式 → 设置参数并开始处理</p>
            </div>

            <div
              ref={step1Ref}
              className={`card-base step-card ${step === 1 ? 'is-active' : 'is-collapsed'}`}
              onClick={() => setStep(1)}
              role="button"
              tabIndex={0}
            >
              <div className="step-card__header">
                <div className="step-card__title">
                  <span className="step-pill">Step 1</span>
                  <span>上传音频</span>
                </div>
                <div className="step-card__meta">{hasFile ? file?.name : '支持 MP3 / WAV / FLAC'}</div>
              </div>
              <div className="step-card__body">
                <div className="upload-section">
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
                          <Button className="delete-btn" icon={<DeleteOutlined />} onClick={handleDeleteFile} type="text" danger>
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="step-card__footer">
                  <Button type="primary" onClick={() => setStep(2)} disabled={!hasFile}>
                    下一步
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={step2Ref}
              className={`card-base step-card ${step === 2 ? 'is-active' : 'is-collapsed'}`}
              onClick={() => hasFile && setStep(2)}
              role="button"
              tabIndex={0}
            >
              <div className="step-card__header">
                <div className="step-card__title">
                  <span className="step-pill">Step 2</span>
                  <span>选择分离方式</span>
                </div>
                <div className="step-card__meta">
                  {mode === 'vocal' ? '人声分离' : mode === 'demucs4' ? '4 轨分离' : '6 轨分离'}
                </div>
              </div>
              <div className="step-card__body">
                <div className="mode-section">
                  <div className="mode-buttons">
                    <button
                      className={`mode-btn ${mode === 'vocal' ? 'active' : ''}`}
                      onClick={() => setMode('vocal')}
                      disabled={loading}
                      type="button"
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
                      type="button"
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
                      type="button"
                    >
                      <span className="mode-icon">🎹</span>
                      <div className="mode-content">
                        <div className="mode-name">6 轨分离</div>
                        <div className="mode-desc">扩展多轨</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="step-card__footer step-footer-split">
                  <Button onClick={() => setStep(1)}>上一步</Button>
                  <Button type="primary" onClick={() => setStep(3)} disabled={!hasFile}>
                    下一步
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={step3Ref}
              className={`card-base step-card ${step === 3 ? 'is-active' : 'is-collapsed'}`}
              onClick={() => hasFile && setStep(3)}
              role="button"
              tabIndex={0}
            >
              <div className="step-card__header">
                <div className="step-card__title">
                  <span className="step-pill">Step 3</span>
                  <span>设置参数并开始</span>
                </div>
                <div className="step-card__meta">{loading ? '处理中…' : '准备就绪'}</div>
              </div>
              <div className="step-card__body">
                <div className="options-section">
                  <div className="options-content">
                    {mode === 'vocal' && (
                      <div className="option-item">
                        <label className="option-label">模型选择</label>
                        <Select value={modelName} onChange={setModelName} className="option-select" disabled={loading}>
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
                      <Select value={outputFormat} onChange={(value) => setOutputFormat(value)} className="option-select" disabled={loading}>
                        <Option value="wav">WAV</Option>
                        <Option value="mp3">MP3</Option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="step-card__footer step-footer-split">
                  <Button onClick={() => setStep(2)}>上一步</Button>
                  <Button
                    type="primary"
                    onClick={handleStartSeparation}
                    disabled={!mediaDTO || !mediaDTO.id || loading}
                    className="start-btn"
                    loading={loading}
                  >
                    {loading ? '处理中...' : '开始分离'}
                  </Button>
                </div>

                {loading && (
                  <div className="progress-section">
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
                  </div>
                )}

                {tracks.length > 0 && (
                  <div className="results-section">
                    <h3 className="results-title">分离结果</h3>
                    <div className="results-grid">
                      {tracks.map((track, index) => (
                        <div key={index} className="card-base result-card">
                          <div className="result-card-header">
                            <h4 className="result-card-title">{track.name}</h4>
                            {track.description && <p className="result-card-desc">{track.description}</p>}
                          </div>
                          <div className="result-card-content">
                            {track.url ? (
                              <AudioPlayer url={track.url} fileName={track.name} />
                            ) : (
                              <div className="audio-placeholder">
                                <p className="placeholder-text">音频文件暂未生成</p>
                              </div>
                            )}
                            <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(track)} className="download-btn">
                              下载
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="service-right">
            <div className="card-base side-card">
              <div className="side-card__title">下一步可以做什么？</div>
              <div className="side-card__list">
                <div className="side-card__item">
                  <div className="side-card__item-title">AI 翻唱</div>
                  <Tag className="side-tag">敬请期待</Tag>
                </div>
                <div className="side-card__item">
                  <div className="side-card__item-title">封面生成</div>
                  <Tag className="side-tag">规划中</Tag>
                </div>
                <div className="side-card__item">
                  <div className="side-card__item-title">图 + 音乐短视频</div>
                  <Tag className="side-tag">规划中</Tag>
                </div>
              </div>
            </div>

            <div className="card-base side-card">
              <div className="side-card__title">帮助 / 文档</div>
              <div className="side-card__list">
                <button className="side-link" type="button" onClick={() => appMessage.info('教程页面待接入')}>
                  使用教程
                </button>
                <button className="side-link" type="button" onClick={() => appMessage.info('模型说明待接入')}>
                  模型与限制说明
                </button>
                <button className="side-link" type="button" onClick={() => appMessage.info('FAQ 待接入')}>
                  常见问题 FAQ
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default AudioSeparationPage;

