import React, { useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import type { MediaItem } from '../api/post';
import './MediaPreviewList.css';

interface MediaPreviewListProps {
  mediaItems: MediaItem[];
  onDelete: (mediaId: number) => void;
}

const MediaPreviewList: React.FC<MediaPreviewListProps> = ({ mediaItems, onDelete }) => {
  // 所有 hooks 必须在组件顶层调用，不能在条件返回之后
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 清理预览 URL（组件卸载时）
  React.useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
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
            const imageUrl = item.type === 'IMAGE' && item.previewUrl ? item.previewUrl : item.url;
            const videoUrl = item.type === 'VIDEO' && item.previewUrl ? item.previewUrl : item.url;

            return (
              <div key={item.mediaId} className="media-preview-item">
                <div className={`media-preview-content ${item.type === 'VIDEO' ? 'video-content' : 'image-content'}`}>
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
                    <VideoPlayer url={videoUrl} />
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
            const audioUrl = item.previewUrl || item.url;
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

