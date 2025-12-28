import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Button, Tag } from 'antd';
import { fetchSidePanel } from '../../api/sidePanel';
import type { SidePanelDTO } from '../../types/sidePanel';
import './SidePanelCard.css';

// 全局请求缓存和状态管理（所有 SidePanelCard 实例共享）
let globalRequestPromise: Promise<SidePanelDTO> | null = null;
let globalData: SidePanelDTO | null = null;
let globalError: string | null = null;
let globalLoading = false;

const SidePanelCard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(globalLoading);
  const [data, setData] = useState<SidePanelDTO | null>(globalData);
  const [error, setError] = useState<string | null>(globalError);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 如果已有缓存数据，直接使用
    if (globalData) {
      setData(globalData);
      setLoading(false);
      setError(globalError);
      return;
    }

    // 如果正在请求，等待现有请求完成
    if (globalRequestPromise) {
      setLoading(true);
      globalRequestPromise
        .then((result) => {
          setData(result);
          setLoading(false);
          setError(null);
        })
        .catch((err: any) => {
          if (err.message === 'UNAUTHORIZED') {
            setError('UNAUTHORIZED');
          } else {
            setError('FAILED');
          }
          setLoading(false);
        });
      return;
    }

    // 防止 StrictMode 下重复初始化（只在当前组件实例内防止）
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    // 开始新的请求
    loadData();
  }, []);

  const loadData = async () => {
    try {
      globalLoading = true;
      setLoading(true);
      setError(null);
      globalError = null;

      // 创建全局请求 Promise
      globalRequestPromise = fetchSidePanel();

      const result = await globalRequestPromise;
      
      // 更新全局缓存
      globalData = result;
      globalLoading = false;
      globalRequestPromise = null;

      setData(result);
      setLoading(false);
    } catch (err: any) {
      globalLoading = false;
      globalRequestPromise = null;

      if (err.message === 'UNAUTHORIZED') {
        setError('UNAUTHORIZED');
        globalError = 'UNAUTHORIZED';
      } else {
        setError('FAILED');
        globalError = 'FAILED';
        console.error('加载侧边栏数据失败:', err);
      }
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
      {/* 顶部 Header：用户信息 + 天气 */}
      <div className="side-panel-header">
        <div className="side-panel-header-left">
          <div className="side-panel-avatar">
            {getAvatarLetter(user.username)}
          </div>
          <div className="side-panel-user-info">
            <div className="side-panel-username">{user.username}</div>
            <div className="side-panel-city">{user.city || '未知城市'}</div>
          </div>
        </div>
      </div>

      {/* 天气区块：左右两列布局 */}
      {weather ? (
        <div className="side-panel-section side-panel-weather">
          <div className="side-panel-weather-container">
            <div className="side-panel-weather-left">
              <div className="side-panel-weather-main">
                <i className={`qi-${weather.icon}`} />
                <div className="side-panel-weather-temp">
                  <span className="side-panel-temp-value">{weather.temp}°</span>
                  <div className="side-panel-weather-desc">
                    <span className="side-panel-temp-text">{weather.text}</span>
                    <span className="side-panel-weather-city">{user.city || '未知城市'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="side-panel-weather-right">
              <div className="side-panel-weather-metrics">
                <div className="side-panel-metric-item">
                  <div className="side-panel-metric-label">体感</div>
                  <div className="side-panel-metric-value">{weather.feelsLike}°</div>
                </div>
                <div className="side-panel-metric-item">
                  <div className="side-panel-metric-label">湿度</div>
                  <div className="side-panel-metric-value">{weather.humidity}%</div>
                </div>
                <div className="side-panel-metric-item">
                  <div className="side-panel-metric-label">风</div>
                  <div className="side-panel-metric-value">
                    {weather.windDir} {weather.windScale || weather.windSpeed}级
                  </div>
                </div>
                <div className="side-panel-metric-item">
                  <div className="side-panel-metric-label">气压</div>
                  <div className="side-panel-metric-value">{weather.pressure || weather.vis}hPa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="side-panel-section side-panel-weather-empty">
          <div className="side-panel-empty-text">暂无天气数据</div>
        </div>
      )}

      {/* 黄历区块 */}
      {almanac ? (
        <div className="side-panel-section side-panel-almanac">
          <div className="side-panel-almanac-header">
            <div className="side-panel-almanac-date">
              {almanac.date} {almanac.weekday}
            </div>
            <div className="side-panel-almanac-lunar">{almanac.lunarText}</div>
          </div>
          {almanac.yi && almanac.yi.length > 0 ? (
            <div className="side-panel-almanac-row">
              <div className="side-panel-almanac-label">宜</div>
              <div className="side-panel-almanac-tags">
                {almanac.yi.slice(0, 5).map((item, index) => (
                  <Tag key={index} className="side-panel-tag side-panel-tag-yi">
                    {item}
                  </Tag>
                ))}
                {almanac.yi.length > 5 && (
                  <Tag className="side-panel-tag side-panel-tag-more">
                    +{almanac.yi.length - 5}
                  </Tag>
                )}
              </div>
            </div>
          ) : (
            <div className="side-panel-almanac-row">
              <div className="side-panel-almanac-label">宜</div>
              <div className="side-panel-almanac-empty">暂无</div>
            </div>
          )}
          {almanac.ji && almanac.ji.length > 0 ? (
            <div className="side-panel-almanac-row">
              <div className="side-panel-almanac-label">忌</div>
              <div className="side-panel-almanac-tags">
                {almanac.ji.slice(0, 5).map((item, index) => (
                  <Tag key={index} className="side-panel-tag side-panel-tag-ji">
                    {item}
                  </Tag>
                ))}
                {almanac.ji.length > 5 && (
                  <Tag className="side-panel-tag side-panel-tag-more">
                    +{almanac.ji.length - 5}
                  </Tag>
                )}
              </div>
            </div>
          ) : (
            <div className="side-panel-almanac-row">
              <div className="side-panel-almanac-label">忌</div>
              <div className="side-panel-almanac-empty">暂无</div>
            </div>
          )}
        </div>
      ) : (
        <div className="side-panel-section side-panel-almanac-empty">
          <div className="side-panel-empty-text">暂无黄历数据</div>
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

