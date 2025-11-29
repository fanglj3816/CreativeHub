import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Spin, App, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import FeedCard from '../components/FeedCard';
import { getFeed, searchPosts, type PostDTO } from '../api/post';
import { formatPostForFeedCard } from '../utils/postMapper';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [realPosts, setRealPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // 加载真实帖子数据
    loadFeed();
  }, [navigate]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await getFeed(1, 10);
      if (response.code === 0 && response.data) {
        // 后端返回的是 items 字段，不是 content
        const posts = response.data.items || [];
        // 调试：打印帖子数据，检查媒体信息
        console.log('加载 Feed 成功，帖子数量:', posts.length);
        posts.forEach((post) => {
          if (post.mediaList && post.mediaList.length > 0) {
            console.log('帖子媒体信息:', {
              postId: post.id,
              mediaCount: post.mediaList.length,
              firstMedia: post.mediaList[0],
            });
          }
        });
        setRealPosts(posts);
      } else {
        console.warn('加载 Feed 返回非成功状态:', response);
      }
    } catch (error: any) {
      console.error('加载 Feed 失败:', error);
      // 静默处理错误，不显示错误提示，避免影响用户体验
      // 如果后端服务未启动或接口有问题，只显示假数据
      setRealPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchKeyword(value);
    if (!value || value.trim() === '') {
      // 搜索内容为空，重新加载默认 Feed
      loadFeed();
      return;
    }

    try {
      setLoading(true);
      const response = await searchPosts(value.trim());
      if (response.code === 0 && response.data) {
        // 后端返回的是 items 字段
        setRealPosts(response.data.items || []);
      } else {
        console.warn('搜索返回非成功状态:', response);
        setRealPosts([]);
      }
    } catch (error: any) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Mock 数据（假数据，始终显示在真实数据下方）
  const fakeFeedData = [
    {
      id: 1,
      author: {
        name: '音乐人小A',
        avatar: '🎵',
        verified: true,
      },
      content: {
        text: '分享一首原创音乐作品，融合了电子和民谣元素，希望大家喜欢！',
        media: {
          type: 'audio' as const,
          url: '/audio/sample.mp3',
        },
      },
      stats: {
        likes: 234,
        comments: 45,
        shares: 12,
      },
      timestamp: '2小时前',
    },
    {
      id: 2,
      author: {
        name: '摄影师B',
        avatar: '📷',
        verified: true,
      },
      content: {
        text: '城市夜景摄影作品，使用长曝光技术捕捉城市的繁华与宁静。',
        media: {
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
        },
      },
      stats: {
        likes: 567,
        comments: 89,
        shares: 34,
      },
      timestamp: '5小时前',
    },
    {
      id: 3,
      author: {
        name: '创意设计师C',
        avatar: '✨',
        verified: false,
      },
      content: {
        text: '使用 AI 工具创作的视频作品，展示了从音乐到视觉的完整创作流程。',
        media: {
          type: 'video' as const,
          url: '/video/sample.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        },
      },
      stats: {
        likes: 890,
        comments: 123,
        shares: 56,
      },
      timestamp: '1天前',
    },
    {
      id: 4,
      author: {
        name: '音乐制作人D',
        avatar: '🎶',
        verified: true,
      },
      content: {
        text: '新作品发布！这次尝试了不同的风格，融合了爵士和电子音乐。',
        media: {
          type: 'audio' as const,
          url: '/audio/sample2.mp3',
        },
      },
      stats: {
        likes: 432,
        comments: 67,
        shares: 23,
      },
      timestamp: '2天前',
    },
    {
      id: 5,
      author: {
        name: '旅行摄影师E',
        avatar: '📸',
        verified: false,
      },
      content: {
        text: '分享一组自然风光摄影作品，记录了大自然的壮美与细腻。',
        media: {
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        },
      },
      stats: {
        likes: 678,
        comments: 98,
        shares: 45,
      },
      timestamp: '3天前',
    },
  ];

  return (
    <MainLayout>
      <div className="home-page">
        <div className="home-top-bar">
          <div className="search-wrapper">
            <Tooltip title="可以发帖子" placement="bottom">
              <button
                className="search-add-btn"
                onClick={() => navigate('/create-post')}
                aria-label="发布帖子"
              >
                <PlusOutlined />
              </button>
            </Tooltip>
            <Input
              className="home-search-input"
              placeholder="搜索作品、用户..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            />
            <button
              className="search-submit-btn"
              onClick={() => handleSearch(searchKeyword)}
              aria-label="搜索"
            >
              <SearchOutlined />
            </button>
          </div>
        </div>

        <div className="feed-header">
          <h1 className="feed-title">动态</h1>
          <p className="feed-subtitle">发现精彩的音乐与摄影作品</p>
        </div>
        
        <div className="feed-container">
          {loading && (
            <div className="feed-loading">
              <Spin size="large" />
            </div>
          )}
          
          {/* 真实帖子数据 */}
          {!loading && realPosts.map((post) => {
            const feedCardData = formatPostForFeedCard(post);
            return (
              <FeedCard
                key={`real-${post.id}`}
                {...feedCardData}
                onDeleted={(deletedId) => {
                  setRealPosts((prev) => prev.filter((p) => p.id !== deletedId));
                }}
              />
            );
          })}

          {/* 假数据（始终显示在真实数据下方） */}
          {fakeFeedData.map((item) => (
            <FeedCard key={`fake-${item.id}`} {...item} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
