import React from 'react';
import type { Inspiration } from '../../mock/homepageMock';
import './InspirationCard.css';

interface InspirationCardProps {
  inspirations: Inspiration[];
}

const InspirationCard: React.FC<InspirationCardProps> = ({ inspirations }) => {
  return (
    <div className="inspiration-card">
      <div className="card-header">
        <h3 className="card-title">今日灵感</h3>
      </div>
      <div className="inspirations-list">
        {inspirations.map((inspiration) => (
          <div key={inspiration.id} className="inspiration-item">
            <div className="inspiration-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="inspiration-text">{inspiration.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InspirationCard;














