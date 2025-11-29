import React, { useState, useEffect, useRef } from 'react';
import { Button, Progress, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import { getMediaStatus, type MediaDTO } from '../api/media';
import type { MediaItem } from '../api/post';
import './MediaPreviewList.css';

interface MediaPreviewListProps {
  mediaItems: MediaItem[];
  onDelete: (mediaId: number) => void;
}

const MediaPreviewList: React.FC<MediaPreviewListProps> = ({ mediaItems, onDelete }) => {
  // 所有 hooks 必须在组件顶层调用，不能在条件返回之后
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [mediaStatusMap, setMediaStatusMap] = useState<Map<number, MediaDTO>>(new Map());
  const pollingIntervalsRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  // 清理预览 URL（组件卸载时）
  React.useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      // 清理所有轮询定时器
      pollingIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pollingIntervalsRef.current.clear();
    };
  }, [mediaItems]);

  // 轮询转码状态
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    mediaItems.forEach((item) => {
      // 如果是视频且状态为处理中，开始轮询
      if (item.type === 'VIDEO' && item.status === 1 && item.mediaId) {
        const startPolling = () => {
          const interval = setInterval(async () => {
            try {
              const status = await getMediaStatus(item.mediaId);
              console.debug('MediaPreviewList: 收到转码状态更新', {
                mediaId: item.mediaId,
                status: status.status,
                progress: status.progress,
                url: status.url
              });
              setMediaStatusMap((prev) => {
                const newMap = new Map(prev);
                newMap.set(item.mediaId, status);
                return newMap;
              });

              // 如果转码完成或失败，停止轮询
              if (status.status === 0 || status.status === 2) {
                clearInterval(interval);
                pollingIntervalsRef.current.delete(item.mediaId);
                
                if (status.status === 0) {
                  message.success(`视频 "${item.fileName || '未命名'}" 转码完成`);
                } else if (status.status === 2) {
                  message.error(`视频 "${item.fileName || '未命名'}" 转码失败: ${status.errorMsg || '未知错误'}`);
                }
              }
            } catch (error) {
              console.error('Failed to poll media status:', error);
            }
          }, 1000); // 每1秒轮询一次

          pollingIntervalsRef.current.set(item.mediaId, interval);
        };

        // 延迟启动轮询，避免立即请求
        const timeout = setTimeout(startPolling, 500);
        cleanupFunctions.push(() => {
          clearTimeout(timeout);
          const interval = pollingIntervalsRef.current.get(item.mediaId);
          if (interval) {
            clearInterval(interval);
            pollingIntervalsRef.current.delete(item.mediaId);
          }
        });
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [mediaItems]);

  const handleImageError = (mediaId: number) => {
    setImageErrors((prev) => new Set(prev).add(mediaId));
  };

  // 条件判断移到 hooks 之后
  if (mediaItems.length === 0) {
    return null;
  }

  // 分离图片/视频和音频
  const imageVideoItems = mediaItems.filter(item => item.type === 'IMAGE' || item.type === 'VIDEO');
  const audioItems = mediaItems.filter(item => item.type === 'AUDIO');

  return (
    <div className="media-preview-list">
      {/* 图片和视频：网格布局 */}
      {imageVideoItems.length > 0 && (
        <div className="media-preview-grid">
          {imageVideoItems.map((item) => {
            const imageUrl = item.type === 'IMAGE' && item.previewUrl ? item.previewUrl : (item.url || '');
            const statusInfo = mediaStatusMap.get(item.mediaId);
            const currentStatus = statusInfo?.status ?? item.status ?? 0;
            const currentProgress = statusInfo?.progress ?? item.progress;
            const currentUrl = statusInfo?.url ?? item.url;
            const videoUrl = item.type === 'VIDEO' && item.previewUrl ? item.previewUrl : (currentUrl || '');

            return (
              <div key={item.mediaId} className="media-preview-item">
                <div className="media-preview-content">
                  {item.type === 'IMAGE' && (
                    <>
                      {imageErrors.has(item.mediaId) ? (
                        <div className="preview-error">
                          <span>图片加载失败</span>
                        </div>
                      ) : (
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="preview-image"
                          onError={() => handleImageError(item.mediaId)}
                          loading="lazy"
                        />
                      )}
                    </>
                  )}
                  {item.type === 'VIDEO' && (
                    <>
                      {currentStatus === 1 ? (
                        // 转码中：显示进度条
                        <div className="video-transcoding-placeholder">
                          <div className="transcoding-content">
                            <div className="transcoding-icon-wrapper">
                              <div className="transcoding-icon"></div>
                            </div>
                            <div className="transcoding-text">视频转码中</div>
                            <Progress
                              percent={currentProgress !== undefined && currentProgress !== null ? Math.round(currentProgress * 100) : 0}
                              status="active"
                              strokeColor="#00d4ff"
                              showInfo={true}
                              className="transcoding-progress"
                            />
                          </div>
                        </div>
                      ) : currentStatus === 2 ? (
                        // 转码失败
                        <div className="video-error-placeholder">
                          <div className="error-content">
                            <div className="error-icon">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="error-text">转码失败</div>
                            {statusInfo?.errorMsg && (
                              <div className="error-msg">{statusInfo.errorMsg}</div>
                            )}
                          </div>
                        </div>
                      ) : currentUrl ? (
                        // 转码完成：显示视频播放器
                        <VideoPlayer url={currentUrl} />
                      ) : (
                        // 使用预览URL作为后备
                        <VideoPlayer url={videoUrl || ''} />
                      )}
                    </>
                  )}
                </div>
                <Button
                  className="delete-btn"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (item.previewUrl) {
                      URL.revokeObjectURL(item.previewUrl);
                    }
                    onDelete(item.mediaId);
                  }}
                  danger
                  type="text"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 音频：竖排布局 */}
      {audioItems.length > 0 && (
        <div className="media-preview-audio-list">
          {audioItems.map((item) => {
            const audioUrl = item.previewUrl || item.url || '';
            if (!audioUrl) {
              return null;
            }
            return (
              <div key={item.mediaId} className="media-preview-audio-item">
                <AudioPlayer url={audioUrl} fileName={item.fileName} />
                <Button
                  className="delete-btn"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (item.previewUrl) {
                      URL.revokeObjectURL(item.previewUrl);
                    }
                    onDelete(item.mediaId);
                  }}
                  danger
                  type="text"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaPreviewList;

