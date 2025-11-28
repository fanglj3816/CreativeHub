import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import FeedCard from '../components/FeedCard';
import { getPostDetail, type PostDTO } from '../api/post';
import { formatPostForFeedCard } from '../utils/postMapper';
import './PostDetail.css';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDTO | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        message.error('帖子 ID 无效');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await getPostDetail(Number(id));
        if (response.code === 0 && response.data) {
          setPost(response.data);
        } else {
          message.error(response.message || '获取帖子详情失败');
          navigate('/');
        }
      } catch (error: any) {
        message.error(error.response?.data?.message || '获取帖子详情失败');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="post-detail-page">
          <div className="post-detail-loading">
            <Spin size="large" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return null;
  }

  const feedCardData = formatPostForFeedCard(post);

  return (
    <MainLayout>
      <div className="post-detail-page">
        <div className="post-detail-header">
          <Button
            className="back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          >
            返回
          </Button>
          <h1 className="post-detail-title">帖子详情</h1>
          <div className="header-placeholder" />
        </div>

        <div className="post-detail-content">
          <FeedCard {...feedCardData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetail;

