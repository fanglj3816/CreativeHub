import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './AudioPlayer.css';

interface AudioPlayerProps {
  url: string; // 音频地址
  fileName?: string; // 文件名
  duration?: number; // 可选（从后端或前端解析）
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, fileName, duration }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isUnmountingRef = useRef(false);

  // 初始化 WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    isUnmountingRef.current = false;
    setHasError(false);

    // 检查 URL
    if (!url || url.trim() === '') {
      console.warn('AudioPlayer: 音频 URL 为空');
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // 检测音频格式，决定使用哪个后端
    const extension = url.split('.').pop()?.toLowerCase();
    // FLAC 等格式需要使用 MediaElement 后端
    const useMediaElement = ['flac', 'wma', 'aac', 'm4a'].includes(extension || '');

    let wavesurfer: WaveSurfer | null = null;

    try {
      // 根据格式选择后端：FLAC 等格式使用 MediaElement，其他使用 WebAudio
      wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#2A7FFF',
        progressColor: '#5BC7FF',
        cursorColor: '#00d4ff',
        barWidth: 3,
        barRadius: 3,
        barGap: 2,
        height: 80,
        normalize: true,
        backend: useMediaElement ? 'MediaElement' : 'WebAudio',
        mediaControls: false,
      });

      wavesurferRef.current = wavesurfer;

      // 监听事件
      wavesurfer.on('ready', () => {
        if (isUnmountingRef.current) return;
        setIsLoading(false);
        setHasError(false);
        const duration = wavesurfer?.getDuration();
        if (duration) {
          setTotalDuration(duration);
        }
      });

      wavesurfer.on('play', () => {
        if (!isUnmountingRef.current) {
          setIsPlaying(true);
        }
      });

      wavesurfer.on('pause', () => {
        if (!isUnmountingRef.current) {
          setIsPlaying(false);
        }
      });

      wavesurfer.on('finish', () => {
        if (!isUnmountingRef.current) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      });

      wavesurfer.on('timeupdate', (time) => {
        if (!isUnmountingRef.current) {
          setCurrentTime(time);
        }
      });

      // 错误处理 - 静默处理，避免过多错误日志
      wavesurfer.on('error', (error) => {
        if (isUnmountingRef.current) return;
        // 只记录非 AbortError 的错误
        if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
          console.warn('AudioPlayer: 音频加载错误', {
            url,
            errorName: error.name,
          });
        }
        setIsLoading(false);
        setHasError(true);
      });

      // 加载音频
      wavesurfer.load(url).catch((error) => {
        if (isUnmountingRef.current) return;
        // 忽略 AbortError（通常是组件卸载导致的）
        if (error?.name !== 'AbortError') {
          console.warn('AudioPlayer: 加载音频失败', { 
            url, 
            errorName: error?.name || 'Unknown' 
          });
          setIsLoading(false);
          setHasError(true);
        }
      });
    } catch (error) {
      console.warn('AudioPlayer: 初始化失败', { url, error });
      setIsLoading(false);
      setHasError(true);
    }

    // 清理
    return () => {
      isUnmountingRef.current = true;
      if (wavesurferRef.current) {
        try {
          // 先停止播放
          if (wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.pause();
          }
          // 直接销毁，不使用 setTimeout
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        } catch (error) {
          // 静默处理清理错误
          wavesurferRef.current = null;
        }
      }
    };
  }, [url]);

  // 播放/暂停
  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  // 点击波形跳转进度
  const handleWaveformClick = () => {
    // WaveSurfer 会自动处理点击跳转
  };

  // 倍速播放
  const handleSpeedChange = (speed: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(speed);
      setPlaybackRate(speed);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 如果出错，显示错误信息
  if (hasError) {
    return (
      <div className="audio-player">
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span>音频加载失败</span>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-player">
      {/* 上方：波形容器 */}
      <div
        className="audio-waveform-container"
        ref={waveformRef}
        onClick={handleWaveformClick}
      />

      {/* 下方：控制区域 */}
      <div className="audio-player-controls">
        {/* 左侧：播放按钮 */}
        <button
          className={`audio-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="audio-loading-spinner" />
          ) : isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* 中间：文件名和时间 */}
        <div className="audio-player-info">
          {fileName && (
            <div className="audio-file-name" title={fileName}>
              {fileName}
            </div>
          )}
          <div className="audio-time">
            <span className="audio-time-current">{formatTime(currentTime)}</span>
            <span className="audio-time-separator">/</span>
            <span className="audio-time-total">{formatTime(totalDuration || duration || 0)}</span>
          </div>
        </div>

        {/* 右侧：倍速控制 */}
        <div className="audio-speed-control">
          {[0.5, 1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              className={`audio-speed-btn ${playbackRate === speed ? 'active' : ''}`}
              onClick={() => handleSpeedChange(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

