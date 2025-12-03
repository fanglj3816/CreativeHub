import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { uploadMedia, type MediaDTO } from '../api/media';
import './MediaUploader.css';

interface AudioUploaderProps {
  onUploadSuccess: (file: File, mediaDTO: MediaDTO) => void;
  onUploadError?: (error: any) => void;
}

/**
 * 音频上传组件
 * 基于 MediaUploader，但只支持音频文件上传
 * 使用相同的样式和后台接口
 */
const AudioUploader: React.FC<AudioUploaderProps> = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    // 验证文件类型
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      message.error('请上传音频文件（MP3, WAV, FLAC）');
      return false;
    }

    setUploading(true);
    
    try {
      const mediaDTO: MediaDTO = await uploadMedia(file);
      
      onUploadSuccess(file, mediaDTO);
      message.success('上传成功');
      
      return false; // 阻止默认上传行为
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '上传失败，请重试';
      message.error(errorMessage);
      
      if (onUploadError) {
        onUploadError(error);
      }
      
      return false;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-uploader">
      <div className="upload-buttons">
        <Upload
          accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/x-flac,.mp3,.wav,.flac"
          showUploadList={false}
          beforeUpload={handleUpload}
          disabled={uploading}
        >
          <Button
            className="upload-btn audio-btn"
            icon={<SoundOutlined />}
            disabled={uploading}
            loading={uploading}
          >
            {uploading ? '上传中...' : '上传音频'}
          </Button>
        </Upload>
      </div>
    </div>
  );
};

export default AudioUploader;

