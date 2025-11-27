import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import FeedCard from '../components/FeedCard';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Mock 数据
  const feedData = [
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
        <div className="feed-header">
          <h1 className="feed-title">动态</h1>
          <p className="feed-subtitle">发现精彩的音乐与摄影作品</p>
        </div>
        
        <div className="feed-container">
          {feedData.map((item) => (
            <FeedCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
