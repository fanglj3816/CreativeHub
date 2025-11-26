import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'antd';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <Card className="home-card">
        <h1>Welcome to CreativeHub</h1>
        <p>欢迎来到 CreativeHub 创意分享平台</p>
        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 24px',
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            退出登录
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Home;

