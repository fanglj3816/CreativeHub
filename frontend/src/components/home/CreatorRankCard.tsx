import React, { useState } from 'react';
import type { CreatorRank } from '../../mock/homepageMock';
import './CreatorRankCard.css';

interface CreatorRankCardProps {
  creators: CreatorRank[];
}

const CreatorRankCard: React.FC<CreatorRankCardProps> = ({ creators }) => {
  const [followingStates, setFollowingStates] = useState<Record<number, boolean>>({});

  const handleFollow = (id: number) => {
    setFollowingStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="creator-rank-card">
      <div className="card-header">
        <h3 className="card-title">热门创作者</h3>
      </div>
      <div className="creators-list">
        {creators.map((creator, index) => (
          <div key={creator.id} className="creator-item">
            <div className="creator-rank">{index + 1}</div>
            <div className="creator-avatar">
              <img
                src={creator.avatar}
                alt={creator.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="creator-info">
              <div className="creator-name">{creator.name}</div>
              <div className="creator-fans">{creator.fans} 粉丝</div>
            </div>
            <button
              className={`follow-btn-small ${followingStates[creator.id] ? 'following' : ''}`}
              onClick={() => handleFollow(creator.id)}
            >
              {followingStates[creator.id] ? '已关注' : '关注'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorRankCard;






