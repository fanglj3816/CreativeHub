import React from 'react';
import { Upload, Button, message } from 'antd';
import { PictureOutlined, VideoCameraOutlined, SoundOutlined } from '@ant-design/icons';
import { uploadMedia } from '../api/media';
import type { MediaItem } from '../api/post';
import './MediaUploader.css';

interface MediaUploaderProps {
  onUploadSuccess: (mediaItem: MediaItem) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUploadSuccess }) => {
  const handleUpload = async (file: File, type: 'IMAGE' | 'VIDEO' | 'AUDIO') => {
    // 先创建本地预览 URL
    const previewUrl = URL.createObjectURL(file);
    
    try {
      const response = await uploadMedia(file);
      if (response.code === 0 && response.data) {
        const mediaItem: MediaItem = {
          mediaId: response.data.id,
          url: response.data.url,
          type,
          sortOrder: 0, // 将在父组件中更新
          previewUrl, // 保留本地预览 URL
          fileName: file.name, // 传递文件名
        };
        onUploadSuccess(mediaItem);
        message.success('上传成功');
      } else {
        URL.revokeObjectURL(previewUrl); // 清理预览 URL
        message.error(response.message || '上传失败');
      }
    } catch (error: any) {
      URL.revokeObjectURL(previewUrl); // 清理预览 URL
      message.error(error.response?.data?.message || '上传失败，请重试');
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件');
      return;
    }
    handleUpload(file, 'IMAGE');
  };

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      message.error('请选择视频文件');
      return;
    }
    handleUpload(file, 'VIDEO');
  };

  const handleAudioUpload = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      message.error('请选择音频文件');
      return;
    }
    handleUpload(file, 'AUDIO');
  };

  return (
    <div className="media-uploader">
      <div className="upload-buttons">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleImageUpload(file);
            return false;
          }}
        >
          <Button className="upload-btn image-btn" icon={<PictureOutlined />}>
            上传图片
          </Button>
        </Upload>

        <Upload
          accept="video/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleVideoUpload(file);
            return false;
          }}
        >
          <Button className="upload-btn video-btn" icon={<VideoCameraOutlined />}>
            上传视频
          </Button>
        </Upload>

        <Upload
          accept="audio/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleAudioUpload(file);
            return false;
          }}
        >
          <Button className="upload-btn audio-btn" icon={<SoundOutlined />}>
            上传音频
          </Button>
        </Upload>
      </div>
    </div>
  );
};

export default MediaUploader;

