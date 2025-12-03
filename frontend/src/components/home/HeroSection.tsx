import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: '音频分离',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line x1="9" y1="9" x2="21" y2="7" />
        </svg>
      ),
      onClick: () => navigate('/audio/tools/separation'),
    },
    {
      id: 2,
      title: 'AI 翻唱',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      onClick: () => console.log('AI 翻唱'),
    },
    {
      id: 3,
      title: '修图调色',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <circle cx="12" cy="13" r="3" />
          <path d="M17 5V3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
        </svg>
      ),
      onClick: () => console.log('修图调色'),
    },
    {
      id: 4,
      title: '视频生成',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
      onClick: () => console.log('视频生成'),
    },
  ];

  return (
    <section className="hero-section">
      <div className="hero-left">
        <h1 className="hero-title">
          欢迎来到 CreativeHub
          <br />
          发现、创作、分享你的创意作品
        </h1>
      </div>
      <div className="hero-right">
        <div className="hero-actions">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="hero-action-btn"
              onClick={action.onClick}
              aria-label={action.title}
            >
              <div className="action-icon">{action.icon}</div>
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
