import React, { useState } from 'react';
import './CreatorCard.css';

interface CreatorCardProps {
  id: number;
  name: string;
  avatar: string;
  followers: string;
  isFollowing: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ name, avatar, followers, isFollowing: initialFollowing }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="creator-card">
      <div className="creator-avatar">{avatar}</div>
      <div className="creator-info">
        <div className="creator-name">{name}</div>
        <div className="creator-followers">{followers} 关注者</div>
      </div>
      <button
        className={`follow-btn ${isFollowing ? 'following' : ''}`}
        onClick={handleFollow}
      >
        {isFollowing ? '已关注' : '关注'}
      </button>
    </div>
  );
};

export default CreatorCard;




