import React from 'react';
import QuickActionCard from './QuickActionCard';
import CreatorCard from './CreatorCard';
import './RightPanel.css';

const RightPanel: React.FC = () => {
  const quickActions = [
    {
      id: 1,
      title: '音频分离',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line x1="9" y1="9" x2="21" y2="7" />
        </svg>
      ),
      description: '分离人声和伴奏',
    },
    {
      id: 2,
      title: 'AI 翻唱',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      description: 'AI 智能翻唱转换',
    },
    {
      id: 3,
      title: '修图调色',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <circle cx="12" cy="13" r="3" />
          <path d="M17 5V3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
        </svg>
      ),
      description: '专业级图片处理',
    },
    {
      id: 4,
      title: '视频生成',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
      description: 'AI 视频创作工具',
    },
  ];

  const creators = [
    {
      id: 1,
      name: '音乐人小A',
      avatar: '🎵',
      followers: '12.5k',
      isFollowing: false,
    },
    {
      id: 2,
      name: '摄影师B',
      avatar: '📷',
      followers: '8.3k',
      isFollowing: true,
    },
    {
      id: 3,
      name: '创意设计师C',
      avatar: '✨',
      followers: '15.2k',
      isFollowing: false,
    },
  ];

  const inspirations = [
    {
      id: 1,
      title: '夏日音乐节',
      type: '音乐',
      icon: '🎵',
    },
    {
      id: 2,
      title: '城市夜景',
      type: '摄影',
      icon: '📷',
    },
    {
      id: 3,
      title: '创意混音',
      type: '音乐',
      icon: '🎶',
    },
  ];

  return (
    <aside className="right-panel">
      <div className="panel-section">
        <h3 className="section-title">快捷入口</h3>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <QuickActionCard key={action.id} {...action} />
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">热门创作者</h3>
        <div className="creators-list">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} {...creator} />
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">创作灵感</h3>
        <div className="inspirations-list">
          {inspirations.map((inspiration) => (
            <div key={inspiration.id} className="inspiration-card">
              <div className="inspiration-icon">{inspiration.icon}</div>
              <div className="inspiration-content">
                <div className="inspiration-title">{inspiration.title}</div>
                <div className="inspiration-type">{inspiration.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;








