import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from './AudioPlayer';
import './FeedCard.css';

// 默认头像组件（使用 IconPark Me 图标，符合系统 UI）
const DefaultAvatar: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="rgba(0, 212, 255, 0.1)"/>
    <g transform="translate(12, 12)">
      {/* IconPark Me 图标 - 调整颜色为系统主题色 */}
      <circle cx="12" cy="8" r="4" stroke="rgba(0, 212, 255, 0.8)" strokeWidth="1.5" fill="none"/>
      <path 
        d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" 
        stroke="rgba(0, 212, 255, 0.8)" 
        strokeWidth="1.5" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="8" r="3" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="1" fill="none"/>
    </g>
  </svg>
);

interface FeedCardProps {
  id: number;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: {
    text?: string;
    media?: {
      type: 'image' | 'video' | 'audio';
      url: string;
      thumbnail?: string;
    };
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  onClick?: () => void; // 可选的点击处理函数
}

const FeedCard: React.FC<FeedCardProps> = ({ id, author, content, stats, timestamp, onClick }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或链接，不触发卡片点击
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    if (onClick) {
      onClick();
    } else {
      navigate(`/post/${id}`);
    }
  };

  const renderMedia = () => {
    if (!content.media) return null;

    switch (content.media.type) {
      case 'image':
        if (!content.media.url) {
          console.warn('FeedCard: 图片 URL 为空', { postId: id, media: content.media });
          return null;
        }
        return (
          <div className="media-container image-container">
            {imageError ? (
              <div className="media-error">
                <span>图片加载失败</span>
              </div>
            ) : (
              <img
                src={content.media.url}
                alt="Post content"
                onError={(e) => {
                  console.error('FeedCard: 图片加载失败', {
                    postId: id,
                    url: content.media?.url,
                    error: e,
                  });
                  setImageError(true);
                }}
                onLoad={() => {
                  // 图片加载成功，清除错误状态
                  if (imageError) {
                    setImageError(false);
                  }
                }}
                loading="lazy"
              />
            )}
          </div>
        );
      case 'video':
        return (
          <div className="media-container video-container">
            <video src={content.media.url} controls poster={content.media.thumbnail} />
          </div>
        );
      case 'audio':
        return (
          <div className="media-container audio-container">
            <AudioPlayer url={content.media.url} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article className="feed-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card-header">
        <div className="author-info">
          <div className="author-avatar">
            {author.avatar && (author.avatar.startsWith('http://') || author.avatar.startsWith('https://')) ? (
              <img src={author.avatar} alt={author.name} onError={(e) => {
                // 如果图片加载失败，显示默认头像
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // 如果还没有默认头像，添加它
                const parent = target.parentElement;
                if (parent && !parent.querySelector('svg')) {
                  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  svg.setAttribute('width', '48');
                  svg.setAttribute('height', '48');
                  svg.setAttribute('viewBox', '0 0 48 48');
                  svg.setAttribute('fill', 'none');
                  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                  
                  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                  bgCircle.setAttribute('cx', '24');
                  bgCircle.setAttribute('cy', '24');
                  bgCircle.setAttribute('r', '24');
                  bgCircle.setAttribute('fill', 'rgba(0, 212, 255, 0.1)');
                  
                  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                  g.setAttribute('transform', 'translate(12, 12)');
                  
                  const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                  outerCircle.setAttribute('cx', '12');
                  outerCircle.setAttribute('cy', '12');
                  outerCircle.setAttribute('r', '10');
                  outerCircle.setAttribute('stroke', 'rgba(0, 212, 255, 0.4)');
                  outerCircle.setAttribute('stroke-width', '1.5');
                  outerCircle.setAttribute('fill', 'none');
                  
                  const headCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                  headCircle.setAttribute('cx', '12');
                  headCircle.setAttribute('cy', '8');
                  headCircle.setAttribute('r', '3');
                  headCircle.setAttribute('stroke', '#00d4ff');
                  headCircle.setAttribute('stroke-width', '1.5');
                  headCircle.setAttribute('fill', 'none');
                  headCircle.setAttribute('stroke-linecap', 'round');
                  headCircle.setAttribute('stroke-linejoin', 'round');
                  
                  const bodyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  bodyPath.setAttribute('d', 'M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6');
                  bodyPath.setAttribute('stroke', '#00d4ff');
                  bodyPath.setAttribute('stroke-width', '1.5');
                  bodyPath.setAttribute('fill', 'none');
                  bodyPath.setAttribute('stroke-linecap', 'round');
                  bodyPath.setAttribute('stroke-linejoin', 'round');
                  
                  g.appendChild(outerCircle);
                  g.appendChild(headCircle);
                  g.appendChild(bodyPath);
                  svg.appendChild(bgCircle);
                  svg.appendChild(g);
                  parent.appendChild(svg);
                }
              }} />
            ) : (
              <DefaultAvatar />
            )}
          </div>
          <div className="author-details">
            <div className="author-name">
              {author.name}
              {author.verified && (
                <svg className="verified-badge" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.82.34 3.68L1 12l2.44 2.78-.34 3.68 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z" />
                </svg>
              )}
            </div>
            <div className="post-timestamp">{timestamp}</div>
          </div>
        </div>
      </div>

      {content.text && (
        <div className="card-content">
          <p>{content.text}</p>
        </div>
      )}

      {content.media && content.media.url && renderMedia()}

      <div className="card-footer">
        <div className="card-actions">
          <button
            className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likeCount}</span>
          </button>

          <button className="action-btn comment-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{stats.comments}</span>
          </button>

          <button className="action-btn share-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{stats.shares}</span>
          </button>

          <button
            className={`action-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default FeedCard;

