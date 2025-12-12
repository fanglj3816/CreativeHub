import React, { useRef } from 'react';
import { Skeleton } from 'antd';
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons';
import './FeedTrendingSection.css';

export interface TrendingItem {
  id: number | string;
  title: string;
  coverUrl: string;
  tag?: string;
  onClick?: () => void;
}

interface FeedTrendingSectionProps {
  items: TrendingItem[];
  loading?: boolean;
}

const FeedTrendingSection: React.FC<FeedTrendingSectionProps> = ({ items, loading }) => {
  const listRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="feed-trending card-base">
      <div className="trending-header">
        <div>
          <div className="trending-title">热门作品</div>
        </div>
        <div className="trending-actions">
          <button
            className="trending-nav-btn"
            aria-label="向左"
            onClick={() => scrollBy(-260)}
          >
            <LeftOutlined />
          </button>
          <button
            className="trending-nav-btn"
            aria-label="向右"
            onClick={() => scrollBy(260)}
          >
            <RightOutlined />
          </button>
          <button
            className="trending-refresh"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ReloadOutlined />
            <span>刷新</span>
          </button>
        </div>
      </div>

      <div className="trending-list" ref={listRef}>
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div className="trending-card" key={`skeleton-${idx}`}>
              <Skeleton active paragraph={false} title={{ style: { width: '100%', height: 140 } }} />
            </div>
          ))}

        {!loading &&
          items.map((item) => (
            <div
              className="trending-card"
              key={item.id}
              onClick={item.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && item.onClick) item.onClick();
              }}
            >
              <div className="trending-cover">
                <img src={item.coverUrl} alt={item.title} loading="lazy" />
                {item.tag && <span className="trending-tag">{item.tag}</span>}
              </div>
              <div className="trending-info">
                <div className="trending-item-title">{item.title}</div>
              </div>
            </div>
          ))}

        {!loading && items.length === 0 && (
          <div className="trending-empty">暂无可展示的热门作品</div>
        )}
      </div>
    </div>
  );
};

export default FeedTrendingSection;

