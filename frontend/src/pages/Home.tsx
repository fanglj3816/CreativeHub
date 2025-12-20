import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Spin, App, Badge } from 'antd';
import {
  SearchOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  BellOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import FeedSidebar, { type FeedFilter } from '../components/feed/FeedSidebar';
import FeedComposer from '../components/feed/FeedComposer';
import FeedTrendingSection, { type TrendingItem } from '../components/feed/FeedTrendingSection';
import FeedRightSidebar from '../components/feed/FeedRightSidebar';
import FeedCard from '../components/FeedCard';
import { getFeed, searchPosts, type PostDTO } from '../api/post';
import { formatPostForFeedCard } from '../utils/postMapper';
import './HomeFeed.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>('TRENDING');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    console.log('Home 组件挂载，开始加载 Feed 数据');
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);

      const response = await getFeed(1, 10);
      console.log('Feed 响应:', response);

      if (response.code === 0 && response.data) {
        const items = response.data.items || [];
        console.log('Feed 数据项数量:', items.length);
        setPosts(items);
      } else {
        console.warn('Feed 响应非成功状态:', response);
        message.warning(response.message || '加载动态失败');
      }
    } catch (error: any) {
      console.error('加载 Feed 失败:', error);
      message.error('加载动态失败，请稍后重试');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchKeyword(value);
    if (!value.trim()) {
      loadFeed();
      return;
    }
    try {
      setLoading(true);
      const response = await searchPosts(value.trim());
      if (response.code === 0 && response.data) {
        setPosts(response.data.items || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (filter === 'TRENDING' || filter === 'FOLLOWING' || filter === 'COMMUNITY') {
      // TODO: 后端支持后替换为真实过滤逻辑
      return posts;
    }
    return posts.filter((post) => {
      const mediaType = post.mediaList?.[0]?.fileType?.toUpperCase();
      if (!mediaType) return false;
      if (filter === 'MUSIC') return mediaType === 'AUDIO';
      if (filter === 'VIDEO') return mediaType === 'VIDEO';
      if (filter === 'PHOTO') return mediaType === 'IMAGE';
      return true;
    });
  }, [filter, posts]);

  const trendingItems: TrendingItem[] = useMemo(() => {
    const withCover = posts
      .filter((p) => p.mediaList && p.mediaList.length > 0 && p.mediaList[0].url)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.content?.slice(0, 80) || '热门作品',
        coverUrl: p.mediaList?.[0]?.url || '',
        tag: p.mediaList?.[0]?.fileType || undefined,
        onClick: () => navigate(`/post/${p.id}`),
      }));
    return withCover;
  }, [navigate, posts]);

  return (
    <MainLayout 
      className="feed-main-layout"
      hideRightPanel 
      hideLeftPanel
    >
      <div className="feed-page">
        <div className="feed-toolbar-wrapper">
          <div className="feed-toolbar">
            <div className="feed-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="logo-text">CreativeHub</span>
            </div>
            <div className="feed-toolbar-right">
              <div className="feed-toolbar-center">
                <div className="feed-top-actions">
                  <button
                    className="top-action-btn active"
                    onClick={() => {
                      setFilter('TRENDING');
                      navigate('/feed');
                    }}
                  >
                    <ThunderboltOutlined /> <span>Feed</span>
                  </button>
                  <button className="top-action-btn" onClick={() => navigate('/service')}>
                    <CustomerServiceOutlined /> <span>Services</span>
                  </button>
                  <button
                    className="top-action-btn"
                    onClick={() => {
                      setFilter('VIDEO');
                      // 这里先保持在 Feed 页面，后续如果有独立 Library 页再替换
                      navigate('/feed');
                    }}
                  >
                    <VideoCameraOutlined /> <span>Library</span>
                  </button>
                </div>

                <Input
                  className="feed-search"
                  style={{ maxWidth: 480 }}
                  placeholder="搜索作品、用户…"
                  prefix={<SearchOutlined />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
                />
              </div>

              <div className="feed-toolbar-actions" aria-label="toolbar actions">
                <button className="toolbar-icon-btn" type="button" aria-label="通知">
                  <Badge count={11} size="small" offset={[-2, 2]}>
                    <BellOutlined />
                  </Badge>
                </button>

                <button className="toolbar-pill-btn" type="button" onClick={() => navigate('/ai-tools')} aria-label="Get">
                  Get
                </button>

                <button className="toolbar-avatar-btn" type="button" aria-label="个人中心">
                  <span className="toolbar-avatar">FF</span>
                </button>

                <button className="toolbar-primary-btn" type="button" onClick={() => navigate('/create-post')} aria-label="发布作品">
                  <PlusOutlined />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="feed-shell">
          <div className="feed-grid">
            <div className="feed-left">
              <FeedSidebar activeFilter={filter} onChange={setFilter} />
            </div>
            <div className="feed-main">
              <FeedComposer onPostSuccess={loadFeed} onGoCreatePost={() => navigate('/create-post')} />

              <FeedTrendingSection items={trendingItems} loading={loading} />

              <div className="feed-list">
                {loading && (
                  <div className="feed-loading">
                    <Spin size="large" />
                  </div>
                )}

                {!loading && filteredPosts.length === 0 && (
                  <div className="feed-empty">
                    <p>暂无动态内容</p>
                  </div>
                )}

                {!loading &&
                  filteredPosts.length > 0 &&
                  filteredPosts.map((post) => {
                    const feedCardData = formatPostForFeedCard(post);
                    return <FeedCard key={post.id} {...feedCardData} />;
                  })}
              </div>
            </div>

            <div className="feed-right">
              <FeedRightSidebar />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
