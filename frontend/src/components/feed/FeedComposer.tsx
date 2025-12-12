import React from 'react';
import { Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PictureOutlined, ThunderboltOutlined } from '@ant-design/icons';
import './FeedComposer.css';

const { TextArea } = Input;

interface FeedComposerProps {
  onPostSuccess?: () => void;
  onGoCreatePost?: () => void;
}

const FeedComposer: React.FC<FeedComposerProps> = ({ onGoCreatePost }) => {
  const navigate = useNavigate();

  const handleInputClick = () => {
    if (onGoCreatePost) {
      onGoCreatePost();
    } else {
      navigate('/create-post');
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInputClick();
  };

  return (
    <div className="feed-composer card-base">
      <div className="composer-top">
        <div className="composer-avatar">
          <span>FF</span>
        </div>
        <div className="composer-input-wrapper">
          <div className="composer-input">
            <TextArea
              placeholder="分享你的创作想法..."
              autoSize={{ minRows: 2, maxRows: 6 }}
              readOnly
              onClick={handleInputClick}
              style={{ cursor: 'pointer' }}
            />
            <div className="composer-input-icon" onClick={handleImageClick}>
              <PictureOutlined />
            </div>
          </div>
        </div>
        <button className="composer-boost-btn" onClick={handleInputClick}>
          <ThunderboltOutlined />
          <span>Boost</span>
        </button>
      </div>
    </div>
  );
};

export default FeedComposer;

