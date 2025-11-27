import React, { useState } from 'react';
import './FeedCard.css';

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
}

const FeedCard: React.FC<FeedCardProps> = ({ author, content, stats, timestamp }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const renderMedia = () => {
    if (!content.media) return null;

    switch (content.media.type) {
      case 'image':
        return (
          <div className="media-container image-container">
            <img src={content.media.url} alt="Post content" />
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
            <div className="audio-waveform">
              <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path
                  d="M 0 30 Q 20 10, 40 30 T 80 30 T 120 30 T 160 30 T 200 30 T 240 30 T 280 30 T 320 30 T 360 30 T 400 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <path
                  d="M 0 30 Q 20 50, 40 30 T 80 30 T 120 30 T 160 30 T 200 30 T 240 30 T 280 30 T 320 30 T 360 30 T 400 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.4"
                />
              </svg>
            </div>
            <div className="audio-controls">
              <button className="play-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <div className="audio-info">
                <span className="audio-title">原创音乐作品</span>
                <span className="audio-duration">3:24</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article className="feed-card">
      <div className="card-header">
        <div className="author-info">
          <div className="author-avatar">{author.avatar}</div>
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

      {content.media && renderMedia()}

      <div className="card-footer">
        <div className="card-actions">
          <button
            className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
            onClick={handleLike}
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
            onClick={handleBookmark}
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

