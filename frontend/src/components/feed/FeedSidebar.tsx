import React from 'react';
import {
  FireOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import './FeedSidebar.css';

export type FeedFilter =
  | 'TRENDING'
  | 'FOLLOWING'
  | 'MUSIC'
  | 'VIDEO'
  | 'PHOTO'
  | 'COMMUNITY';

interface FeedSidebarProps {
  activeFilter: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({ activeFilter, onChange }) => {
  const items: { key: FeedFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'TRENDING', label: 'Trending', icon: <FireOutlined /> },
    { key: 'FOLLOWING', label: 'Following', icon: <TeamOutlined /> },
    { key: 'MUSIC', label: 'Music', icon: <CustomerServiceOutlined /> },
    { key: 'VIDEO', label: 'Video', icon: <VideoCameraOutlined /> },
    { key: 'PHOTO', label: 'Photo / Image', icon: <PictureOutlined /> },
    { key: 'COMMUNITY', label: 'Communities', icon: <AppstoreOutlined /> },
  ];

  return (
    <aside className="feed-sidebar">
      <nav className="feed-sidebar-nav">
        {items.map((item) => (
          <button
            key={item.key}
            className={`feed-sidebar-item ${activeFilter === item.key ? 'active' : ''}`}
            onClick={() => onChange(item.key)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default FeedSidebar;

