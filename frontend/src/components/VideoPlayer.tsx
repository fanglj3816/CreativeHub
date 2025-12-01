import React from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  rounded?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, rounded = true }) => {
  if (!url || url.trim() === '') {
    return null;
  }

  return (
    <div className={`video-player-wrapper ${rounded ? 'rounded' : ''}`}>
      <video
        src={url}
        controls
        poster={poster}
        preload="metadata"
        playsInline
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '500px',
          minHeight: '200px',
          borderRadius: rounded ? 'var(--radius-md)' : '0',
          backgroundColor: 'var(--bg-secondary)',
          display: 'block',
        }}
      />
    </div>
  );
};

export default VideoPlayer;


