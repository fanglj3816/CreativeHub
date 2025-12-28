// 用户信息
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  city: string;
}

// 天气信息
export interface WeatherNowDTO {
  obsTime: string;
  temp: number;
  feelsLike: number;
  icon: string;
  text: string;
  windDir: string;
  windScale: string;
  windSpeed: number;
  humidity: number;
  precip: number;
  pressure: number;
  vis: number;
  cloud: number;
  dew: number;
  [key: string]: any; // 允许其他字段
}

// 黄历信息
export interface AlmanacDTO {
  date: string;
  weekday: string;
  lunarText: string;
  yi: string[];
  ji: string[];
}

// 侧边栏面板数据
export interface SidePanelDTO {
  user: UserDTO;
  weather: WeatherNowDTO | null;
  almanac: AlmanacDTO | null;
  quote: string | null;
}
