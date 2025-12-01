import React from 'react';
import type { UserCardData } from '../../mock/homepageMock';
import './UserCard.css';

interface UserCardProps {
  user: UserCardData;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const handleViewProfile = () => {
    // TODO: 导航到个人主页
    console.log('进入我的主页');
  };

  return (
    <div className="user-card dashboard-card">
      <div className="dashboard-header">
        <div className="user-avatar">
          <img
            src={user.avatar}
            alt={user.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="user-name">{user.name}</div>
      </div>
      <div className="dashboard-stats">
        <div className="stat-row">
          <span className="stat-label">今日创作</span>
          <span className="stat-value">{user.todayCreates} 次</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">我的作品</span>
          <span className="stat-value">{user.totalWorks} 作品</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">我的草稿</span>
          <span className="stat-value">{user.drafts} 个草稿</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">正在渲染</span>
          <span className="stat-value">{user.renderingTasks} 个</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">昨日浏览量</span>
          <span className="stat-value">{user.yesterdayViews}</span>
        </div>
      </div>
      <button className="view-profile-btn" onClick={handleViewProfile}>
        进入我的主页
      </button>
    </div>
  );
};

export default UserCard;

