import React from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightPanel from '../components/RightPanel';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string; // 可选的额外 className
  hideRightPanel?: boolean; // 控制是否隐藏右侧栏
  hideLeftPanel?: boolean;  // 控制是否隐藏左侧栏
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className,
  hideRightPanel = false, 
  hideLeftPanel = false 
}) => {
  const layoutClassName = [
    'main-layout',
    className,
    hideLeftPanel ? 'no-left' : '',
    hideRightPanel ? 'no-right' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={layoutClassName}>
      {!hideLeftPanel && <LeftSidebar />}
      <main className="main-content">{children}</main>
      {!hideRightPanel && <RightPanel />}
    </div>
  );
};

export default MainLayout;



