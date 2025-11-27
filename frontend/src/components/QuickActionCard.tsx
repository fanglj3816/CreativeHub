import React from 'react';
import './QuickActionCard.css';

interface QuickActionCardProps {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, icon, description }) => {
  return (
    <div className="quick-action-card">
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <div className="action-title">{title}</div>
        <div className="action-description">{description}</div>
      </div>
    </div>
  );
};

export default QuickActionCard;

