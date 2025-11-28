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

  // 初始化 WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#2A7FFF',
      progressColor: '#5BC7FF',
      cursorColor: '#00d4ff',
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 80,
      normalize: true,
      backend: 'WebAudio',
      mediaControls: false,
    });

    wavesurferRef.current = wavesurfer;

    // 监听事件
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      const duration = wavesurfer.getDuration();
      if (duration) {
        setTotalDuration(duration);
      }
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    // 加载音频
    if (url) {
      wavesurfer.load(url);
    }

    // 清理
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
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

