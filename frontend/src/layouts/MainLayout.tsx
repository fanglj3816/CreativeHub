import React from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightPanel from '../components/RightPanel';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <LeftSidebar />
      <main className="main-content">
        {children}
      </main>
      <RightPanel />
    </div>
  );
};

export default MainLayout;



