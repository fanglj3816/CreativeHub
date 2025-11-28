import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import MediaUploader from '../components/MediaUploader';
import MediaPreviewList from '../components/MediaPreviewList';
import { createPost, type MediaItem } from '../api/post';
import './CreatePost.css';

const { TextArea } = Input;

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadSuccess = (mediaItem: MediaItem) => {
    const newItem = {
      ...mediaItem,
      sortOrder: mediaItems.length,
    };
    setMediaItems([...mediaItems, newItem]);
  };

  const handleDelete = (mediaId: number) => {
    const updated = mediaItems
      .filter((item) => item.mediaId !== mediaId)
      .map((item, index) => ({ ...item, sortOrder: index }));
    setMediaItems(updated);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      message.warning('请输入内容或上传媒体文件');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPost({
        content: content.trim(),
        contentType: 1,
        mediaItems: mediaItems,
      });

      if (response.code === 0) {
        message.success('发布成功');
        navigate('/', { replace: true });
        // 触发首页刷新（通过 key 或状态管理）
        window.location.reload();
      } else {
        message.error(response.message || '发布失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="create-post-page">
        <div className="create-post-header">
          <Button
            className="back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          >
            返回
          </Button>
          <h1 className="create-post-title">发布作品</h1>
          <div className="header-placeholder" />
        </div>

        <div className="create-post-content">
          <div className="content-input-section">
            <TextArea
              className="content-textarea"
              placeholder="写点什么…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoSize={{ minRows: 6, maxRows: 12 }}
              showCount
              maxLength={2000}
            />
          </div>

          <div className="media-section">
            <MediaUploader onUploadSuccess={handleUploadSuccess} />
            <MediaPreviewList mediaItems={mediaItems} onDelete={handleDelete} />
          </div>
        </div>

        <div className="create-post-footer">
          <Button
            className="submit-btn"
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={(!content.trim() && mediaItems.length === 0) || isSubmitting}
          >
            发布
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePost;

