import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Button, Tag } from 'antd';
import { fetchSidePanel } from '../../api/sidePanel';
import type { SidePanelDTO } from '../../types/sidePanel';
import './SidePanelCard.css';

const SidePanelCard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SidePanelDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSidePanel();
      setData(result);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        setError('UNAUTHORIZED');
      } else {
        setError('FAILED');
        console.error('加载侧边栏数据失败:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取用户头像首字母
  const getAvatarLetter = (username: string): string => {
    return username?.charAt(0)?.toUpperCase() || 'U';
  };

  // 处理未登录/登录过期
  if (error === 'UNAUTHORIZED') {
    return (
      <div className="side-panel-card card-base">
        <div className="side-panel-error">
          <div className="side-panel-error-text">未登录或登录已过期</div>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate('/login')}
            className="side-panel-login-btn"
          >
            前往登录
          </Button>
        </div>
      </div>
    );
  }

  // 加载中状态
  if (loading) {
    return (
      <div className="side-panel-card card-base">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // 数据加载失败（非401/403）
  if (error || !data) {
    return (
      <div className="side-panel-card card-base">
        <div className="side-panel-error">
          <div className="side-panel-error-text">加载失败，请稍后重试</div>
        </div>
      </div>
    );
  }

  const { user, weather, almanac, quote } = data;

  return (
    <div className="side-panel-card card-base">
      {/* 用户信息区块 */}
      <div className="side-panel-section side-panel-user">
        <div className="side-panel-avatar">
          {getAvatarLetter(user.username)}
        </div>
        <div className="side-panel-user-info">
          <div className="side-panel-username">{user.username}</div>
          <div className="side-panel-city">{user.city || '未知城市'}</div>
        </div>
      </div>

      {/* 天气区块 */}
      {weather && (
        <div className="side-panel-section side-panel-weather">
          <div className="side-panel-weather-main">
            <i className={`qi-${weather.icon}`} />
            <div className="side-panel-weather-temp">
              <span className="side-panel-temp-value">{weather.temp}°</span>
              <span className="side-panel-temp-text">{weather.text}</span>
            </div>
          </div>
          <div className="side-panel-weather-detail">
            体感 {weather.feelsLike}° · {weather.windDir} {weather.windScale}级
          </div>
        </div>
      )}

      {/* 黄历区块 */}
      {almanac && (
        <div className="side-panel-section side-panel-almanac">
          <div className="side-panel-almanac-header">
            <div className="side-panel-almanac-date">
              {almanac.date} {almanac.weekday}
            </div>
            <div className="side-panel-almanac-lunar">{almanac.lunarText}</div>
          </div>
          {almanac.yi && almanac.yi.length > 0 && (
            <div className="side-panel-almanac-items">
              <div className="side-panel-almanac-label">宜</div>
              <div className="side-panel-almanac-tags">
                {almanac.yi.slice(0, 4).map((item, index) => (
                  <Tag key={index} className="side-panel-tag side-panel-tag-yi">
                    {item}
                  </Tag>
                ))}
                {almanac.yi.length > 4 && (
                  <Tag className="side-panel-tag side-panel-tag-more">
                    +{almanac.yi.length - 4}
                  </Tag>
                )}
              </div>
            </div>
          )}
          {almanac.ji && almanac.ji.length > 0 && (
            <div className="side-panel-almanac-items">
              <div className="side-panel-almanac-label">忌</div>
              <div className="side-panel-almanac-tags">
                {almanac.ji.slice(0, 4).map((item, index) => (
                  <Tag key={index} className="side-panel-tag side-panel-tag-ji">
                    {item}
                  </Tag>
                ))}
                {almanac.ji.length > 4 && (
                  <Tag className="side-panel-tag side-panel-tag-more">
                    +{almanac.ji.length - 4}
                  </Tag>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 名言区块 */}
      {quote && (
        <div className="side-panel-section side-panel-quote">
          <div className="side-panel-quote-text">{quote}</div>
        </div>
      )}
    </div>
  );
};

export default SidePanelCard;
