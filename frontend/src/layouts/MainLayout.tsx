import React from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightPanel from '../components/RightPanel';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  hideRightPanel?: boolean; // 控制是否隐藏右侧栏
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideRightPanel = false }) => {
  return (
    <div className="main-layout">
      <LeftSidebar />
      <main className="main-content">
        {children}
      </main>
      {!hideRightPanel && <RightPanel />}
    </div>
  );
};

export default MainLayout;



