// 首页 Mock 数据

export interface HotWork {
  id: number;
  type: 'image' | 'audio' | 'video';
  cover: string;
  author: string;
  likes: number;
}

export interface Inspiration {
  id: number;
  text: string;
}

export interface CreatorRank {
  id: number;
  name: string;
  fans: string;
  avatar: string;
}

export interface UserCardData {
  name: string;
  avatar: string;
  todayCreates: number;
  totalWorks: string;
  drafts: string;
  renderingTasks: string;
  yesterdayViews: string;
}

// 热门作品数据
export const hotWorks: HotWork[] = [
  {
    id: 1,
    type: 'image',
    cover: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    author: '摄影师A',
    likes: 120,
  },
  {
    id: 2,
    type: 'audio',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    author: '音乐人小B',
    likes: 88,
  },
  {
    id: 3,
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=600&fit=crop',
    author: '创作者C',
    likes: 203,
  },
  {
    id: 4,
    type: 'image',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    author: '摄影师D',
    likes: 156,
  },
  {
    id: 5,
    type: 'audio',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    author: '音乐人E',
    likes: 92,
  },
  {
    id: 6,
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=600&fit=crop',
    author: '创作者F',
    likes: 178,
  },
  {
    id: 7,
    type: 'image',
    cover: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    author: '摄影师G',
    likes: 234,
  },
  {
    id: 8,
    type: 'audio',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    author: '音乐人H',
    likes: 145,
  },
];

// 今日灵感
export const inspirations: Inspiration[] = [
  {
    id: 1,
    text: '试试用AI翻唱一首你最喜欢的歌',
  },
  {
    id: 2,
    text: '用两张照片生成一段故事短视频',
  },
  {
    id: 3,
    text: '拍摄一张桌面照片，然后用AI调色',
  },
  {
    id: 4,
    text: '录一段口哨音，AI会帮你变成完整旋律',
  },
  {
    id: 5,
    text: '用AI将你的照片变成油画风格',
  },
];

// 热门创作者
export const creatorRanks: CreatorRank[] = [
  {
    id: 1,
    name: '音乐人A',
    fans: '12.5k',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: '摄影师B',
    fans: '8.3k',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: '剪辑师C',
    fans: '15.2k',
    avatar: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=100&h=100&fit=crop',
  },
  {
    id: 4,
    name: '设计师D',
    fans: '9.8k',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
  },
  {
    id: 5,
    name: '音乐制作人E',
    fans: '11.3k',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
  },
];

// 用户卡片数据（当前登录用户 - 工作台风格）
export const currentUser: UserCardData = {
  name: 'ff',
  avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
  todayCreates: 2,
  totalWorks: '42',
  drafts: '6',
  renderingTasks: '1',
  yesterdayViews: '340',
};

// 今日信息
export interface TodayInfo {
  city: string;
  weather: string;
  temperature: string;
  humidity: string;
  windSpeed: string;
  airQuality: string;
  date: string;
  weekday: string;
}

export const todayInfo: TodayInfo = {
  city: '上海',
  weather: '多云',
  temperature: '24℃',
  humidity: '65%',
  windSpeed: '12 km/h',
  airQuality: '良',
  date: '2025 年 11 月 30 日',
  weekday: '周日',
};

