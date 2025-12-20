import React from 'react';
import SidePanelCard from '../sidepanel/SidePanelCard';
import './FeedRightSidebar.css';

interface RecommendUser {
  id: string | number;
  name: string;
  followers: string;
  avatar?: string;
  badge?: string;
}

interface FeedRightSidebarProps {
  users?: RecommendUser[];
}

const FeedRightSidebar: React.FC<FeedRightSidebarProps> = ({ users }) => {
  const mockUsers: RecommendUser[] = users || [
    { id: 1, name: 'Synth Lab', followers: '12.4k', badge: '🔥' },
    { id: 2, name: 'LoFi Maker', followers: '9.8k', badge: '🎧' },
    { id: 3, name: 'Visual Studio', followers: '6.2k', badge: '📷' },
  ];

  return (
    <aside className="feed-right">
      <SidePanelCard />
      <div className="right-card card-base">
        <div className="right-card-header">
          <div>
            <div className="right-title">People to follow</div>
            <div className="right-subtitle">根据你的兴趣推荐创作者</div>
          </div>
          <button className="right-refresh">Refresh</button>
        </div>
        <div className="right-list">
          {mockUsers.map((u) => (
            <div className="right-item" key={u.id}>
              <div className="right-avatar">
                {u.avatar ? <img src={u.avatar} alt={u.name} /> : <span>{u.badge || '🎵'}</span>}
              </div>
              <div className="right-info">
                <div className="right-name">{u.name}</div>
                <div className="right-followers">{u.followers} followers</div>
              </div>
              <button className="right-action">关注</button>
            </div>
          ))}
        </div>
        <div className="right-footer">TODO: 接入真实推荐接口</div>
      </div>
    </aside>
  );
};

export default FeedRightSidebar;

