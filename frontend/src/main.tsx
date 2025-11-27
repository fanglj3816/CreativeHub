import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import './index.css';
import './styles/antd-theme.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: '#16213e',
          colorBgElevated: '#16213e',
          colorBorder: 'rgba(255, 255, 255, 0.15)',
          colorText: '#fff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 12,
        },
        components: {
          Select: {
            optionSelectedBg: 'rgba(0, 212, 255, 0.2)',
            optionActiveBg: 'rgba(255, 255, 255, 0.1)',
            colorBgElevated: '#16213e',
            colorText: '#fff',
            colorBorder: 'rgba(255, 255, 255, 0.15)',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
