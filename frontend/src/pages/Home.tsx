import { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import HeroSection from '../components/home/HeroSection';
import HotWorksSection from '../components/home/HotWorksSection';
import DynamicFeed from '../components/home/DynamicFeed';
import RightSidebar from '../components/home/RightSidebar';
import './Home.css';

const Home = () => {
  useEffect(() => {
    // 给 MainLayout 添加首页专用类名
    const mainLayout = document.querySelector('.main-layout');
    if (mainLayout) {
      mainLayout.classList.add('home-layout');
    }

    // 清理函数：移除类名（如果离开首页）
    return () => {
      if (mainLayout) {
        mainLayout.classList.remove('home-layout');
      }
    };
  }, []);

  return (
    <MainLayout hideRightPanel={true}>
      <div className="home-page">
        <div className="home-main-content">
          <HeroSection />
          <HotWorksSection />
          <DynamicFeed />
        </div>
        <RightSidebar />
      </div>
    </MainLayout>
  );
};

export default Home;
