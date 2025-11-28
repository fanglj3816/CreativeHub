import React from 'react';
import './AuthIllustration.css';

/**
 * 极简背景插画组件
 * 包含：声波线条、相机线框、音符元素
 */
const AuthIllustration: React.FC = () => {
  return (
    <div className="auth-illustration">
      {/* 声波线条 */}
      <svg className="waveform" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path
          d="M 0 50 Q 50 20, 100 50 T 200 50 T 300 50 T 400 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.1"
        />
        <path
          d="M 0 50 Q 50 80, 100 50 T 200 50 T 300 50 T 400 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.08"
        />
      </svg>

      {/* 相机线框轮廓 */}
      <svg className="camera-outline" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
        {/* 相机主体 */}
        <rect x="40" y="30" width="120" height="90" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        {/* 镜头 */}
        <circle cx="100" cy="75" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <circle cx="100" cy="75" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.08" />
        {/* 取景器 */}
        <rect x="60" y="20" width="20" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        {/* 闪光灯 */}
        <circle cx="140" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      </svg>

      {/* 音符元素 */}
      <svg className="note-1" viewBox="0 0 60 80" preserveAspectRatio="xMidYMid meet">
        {/* 音符头部 */}
        <ellipse cx="25" cy="25" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        {/* 音符杆 */}
        <line x1="30" y1="25" x2="30" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        {/* 音符尾 */}
        <path d="M 30 70 Q 40 65, 45 70" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      </svg>

      <svg className="note-2" viewBox="0 0 60 80" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="25" cy="25" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <line x1="30" y1="25" x2="30" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <path d="M 30 70 Q 40 65, 45 70" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      </svg>

      <svg className="note-3" viewBox="0 0 60 80" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="25" cy="25" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <line x1="30" y1="25" x2="30" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <path d="M 30 70 Q 40 65, 45 70" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      </svg>

      {/* 装饰性圆点 */}
      <div className="dot dot-1" />
      <div className="dot dot-2" />
      <div className="dot dot-3" />
    </div>
  );
};

export default AuthIllustration;


