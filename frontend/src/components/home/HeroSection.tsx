import React from 'react';
import { useNavigate } from 'react-router-dom';
import TodayInfoCard from './TodayInfoCard';
import { todayInfo } from '../../mock/homepageMock';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleActionClick = (action: string) => {
    // TODO: 后续可以导航到对应的功能页面
    console.log(`点击了: ${action}`);
  };

  return (
    <section className="hero-section">
      <div className="hero-left">
        <h1 className="hero-title">让 AI 帮你创作音乐、图片与视频，人人都是创作者！</h1>
        <div className="hero-actions">
          <button
            className="hero-action-btn"
            onClick={() => handleActionClick('ai-separate-vocal')}
          >
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
                <line x1="9" y1="9" x2="21" y2="7" />
              </svg>
            </div>
            <span>AI 分离人声</span>
          </button>
          <button
            className="hero-action-btn"
            onClick={() => handleActionClick('ai-cover')}
          >
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span>AI 翻唱</span>
          </button>
          <button
            className="hero-action-btn"
            onClick={() => handleActionClick('ai-retouch')}
          >
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <circle cx="12" cy="13" r="3" />
                <path d="M17 5V3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span>AI 修图</span>
          </button>
          <button
            className="hero-action-btn"
            onClick={() => handleActionClick('ai-video')}
          >
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span>视频生成</span>
          </button>
        </div>
      </div>
      <div className="hero-right">
        <TodayInfoCard todayInfo={todayInfo} />
      </div>
    </section>
  );
};

export default HeroSection;

