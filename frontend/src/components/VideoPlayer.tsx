import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr-react';
import type { APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';
import './VideoPlayer.css';

interface VideoPlayerProps {
  url: string;       // 视频地址
  poster?: string;   // 视频封面，可为空
  rounded?: boolean; // 默认 true，是否保持大圆角风格
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  poster, 
  rounded = true 
}) => {
  const playerRef = useRef<APITypes>(null);

  // 根据 URL 自动检测视频类型
  const getVideoType = (videoUrl: string): string => {
    if (!videoUrl) return 'video/mp4';
    
    // 处理 URL 中的查询参数
    const urlWithoutParams = videoUrl.split('?')[0];
    const extension = urlWithoutParams.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'ogv': 'video/ogg',
      'm3u8': 'application/x-mpegURL',
      'mov': 'video/quicktime',
    };
    return typeMap[extension || ''] || 'video/mp4';
  };

  // 处理封面 URL - 如果 poster 为空字符串或与 url 相同，则不使用
  const getPosterUrl = (): string | undefined => {
    if (!poster || poster.trim() === '') return undefined;
    // 如果 poster 和 url 相同，说明没有单独的封面，返回 undefined
    if (poster === url) return undefined;
    return poster;
  };

  const videoOptions = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'pip',
      'airplay',
      'fullscreen',
    ],
    settings: ['captions', 'quality', 'speed'],
    speed: {
      selected: 1,
      options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    },
    keyboard: {
      focused: true,
      global: false,
    },
    tooltips: {
      controls: true,
      seek: true,
    },
    autoplay: false,
    clickToPlay: true,
    hideControls: true,
    resetOnEnd: false,
    ratio: '16:9',
  };

  // 监听播放器事件
  useEffect(() => {
    let videoElement: HTMLVideoElement | null = null;
    let cleanup: (() => void) | null = null;

    // 使用 setTimeout 确保 Plyr 已经初始化
    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      if (!player) {
        console.warn('VideoPlayer: Plyr 实例未找到', { url });
        return;
      }

      const handleError = (event: Event) => {
        const target = event.target as HTMLVideoElement;
        const error = target?.error;
        console.error('VideoPlayer: 视频加载错误', {
          url,
          error: error ? {
            code: error.code,
            message: error.message,
          } : '未知错误',
          networkState: target?.networkState,
          readyState: target?.readyState,
        });
      };

      const handleLoadedData = () => {
        // 移除调试日志，减少控制台输出
        // console.log('VideoPlayer: 视频加载成功', { url });
      };

      const handleLoadedMetadata = () => {
        // 移除调试日志，减少控制台输出
        // console.log('VideoPlayer: 视频元数据加载成功', { url });
      };

      videoElement = player.media as HTMLVideoElement;
      if (videoElement) {
        videoElement.addEventListener('error', handleError);
        videoElement.addEventListener('loadeddata', handleLoadedData);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

        cleanup = () => {
          if (videoElement) {
            videoElement.removeEventListener('error', handleError);
            videoElement.removeEventListener('loadeddata', handleLoadedData);
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
          }
        };
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) {
        cleanup();
      }
    };
  }, [url]);

  // 验证 URL
  if (!url || url.trim() === '') {
    console.warn('VideoPlayer: 视频 URL 为空');
    return (
      <div className={`video-player-wrapper ${rounded ? 'rounded' : ''}`}>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: 'var(--text-tertiary)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)'
        }}>
          视频地址无效
        </div>
      </div>
    );
  }

  // 处理 URL - 如果是相对路径，可能需要转换为完整 URL
  const getVideoUrl = (): string => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url;
    }
    // 如果是相对路径，尝试添加基础 URL
    // 这里可以根据实际情况调整
    return url;
  };

  const videoUrl = getVideoUrl();
  // 移除调试日志，减少控制台输出
  // console.log('VideoPlayer: 渲染视频播放器', { 
  //   originalUrl: url, 
  //   processedUrl: videoUrl,
  //   poster: getPosterUrl(),
  // });

  return (
    <div className={`video-player-wrapper ${rounded ? 'rounded' : ''}`}>
      <Plyr
        ref={playerRef}
        source={{
          type: 'video',
          sources: [
            {
              src: videoUrl,
              type: getVideoType(videoUrl),
            },
          ],
          poster: getPosterUrl(),
        }}
        options={videoOptions}
      />
    </div>
  );
};

export default VideoPlayer;

