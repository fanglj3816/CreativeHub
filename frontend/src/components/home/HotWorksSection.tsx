import React from 'react';
import { hotWorks, type HotWork } from '../../mock/homepageMock';
import './HotWorksSection.css';

const HotWorksSection: React.FC = () => {
  // 只显示前6个作品（2行3列）
  const displayedWorks = hotWorks.slice(0, 6);

  const renderWorkCover = (work: HotWork) => {
    if (work.type === 'audio') {
      // 音频显示波形图占位
      return (
        <div className="work-cover audio-cover">
          <div className="audio-waveform">
            <div className="waveform-bar" style={{ height: '60%' }}></div>
            <div className="waveform-bar" style={{ height: '80%' }}></div>
            <div className="waveform-bar" style={{ height: '40%' }}></div>
            <div className="waveform-bar" style={{ height: '100%' }}></div>
            <div className="waveform-bar" style={{ height: '50%' }}></div>
            <div className="waveform-bar" style={{ height: '70%' }}></div>
            <div className="waveform-bar" style={{ height: '90%' }}></div>
            <div className="waveform-bar" style={{ height: '30%' }}></div>
          </div>
          <div className="audio-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        </div>
      );
    }
    return (
      <img
        src={work.cover}
        alt={work.author}
        className="work-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  };

  return (
    <section className="hot-works-section">
      <div className="section-header">
        <h2 className="section-title">热门作品</h2>
        <p className="section-subtitle">发现社区最受欢迎的作品</p>
      </div>
      <div className="works-grid">
        {displayedWorks.map((work) => (
          <div key={work.id} className="work-card">
            <div className="work-cover-wrapper">
              {renderWorkCover(work)}
              <div className="work-overlay">
                <div className="work-likes">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{work.likes}</span>
                </div>
              </div>
            </div>
            <div className="work-info">
              <div className="work-author">{work.author}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HotWorksSection;

