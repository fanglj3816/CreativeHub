import React from 'react';
import type { TodayInfo } from '../../mock/homepageMock';
import './TodayInfoCard.css';

interface TodayInfoCardProps {
  todayInfo: TodayInfo;
}

const TodayInfoCard: React.FC<TodayInfoCardProps> = ({ todayInfo }) => {
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case '晴':
        return '☀️';
      case '多云':
        return '☁️';
      case '阴':
        return '☁️';
      case '雨':
        return '🌧️';
      case '雪':
        return '❄️';
      default:
        return '☁️';
    }
  };

  return (
    <div className="today-info-card">
      <div className="today-info-row">
        <span className="weather-info">
          {getWeatherIcon(todayInfo.weather)} {todayInfo.temperature} · {todayInfo.city}
        </span>
      </div>
      <div className="today-info-row">
        <span className="date-info">
          {todayInfo.weekday} · {todayInfo.date}
        </span>
      </div>
      <div className="today-info-details">
        <div className="detail-item">
          <span className="detail-label">空气质量</span>
          <span className="detail-value">{todayInfo.airQuality}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">湿度</span>
          <span className="detail-value">{todayInfo.humidity}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">风速</span>
          <span className="detail-value">{todayInfo.windSpeed}</span>
        </div>
      </div>
    </div>
  );
};

export default TodayInfoCard;

