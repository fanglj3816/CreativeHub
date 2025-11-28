import api from './auth';

export interface MediaItem {
  mediaId: number;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  sortOrder: number;
  previewUrl?: string; // 本地预览 URL（用于上传前显示）
  fileName?: string; // 文件名
}

export interface CreatePostRequest {
  content: string;
  contentType: number;
  mediaItems: MediaItem[];
}

export interface CreatePostResponse {
  code: number;
  message: string;
  data: number; // postId
}

// 后端返回的数据结构
export interface MediaDTO {
  id: number;
  url: string;
  fileType: string; // 'IMAGE' | 'VIDEO' | 'AUDIO'
  width?: number;
  height?: number;
  durationSec?: number;
}

export interface AuthorDTO {
  id: number;
  nickname: string;
  avatar: string;
}

export interface PostDTO {
  id: number;
  content: string;
  contentType: number;
  author: AuthorDTO;
  mediaList: MediaDTO[];
  createdAt: string;
}

export interface PageResponse<T> {
  items: T[]; // 后端返回的是 items 字段
  page: number;
  pageSize: number;
  total: number;
}

export interface FeedResponse {
  code: number;
  message: string;
  data: PageResponse<PostDTO>;
}

export interface PostDetailResponse {
  code: number;
  message: string;
  data: PostDTO;
}

// 创建帖子
export const createPost = async (data: CreatePostRequest): Promise<CreatePostResponse> => {
  const response = await api.post<CreatePostResponse>('/api/post/posts', data);
  return response.data;
};

// 获取 Feed 列表
export const getFeed = async (page: number = 1, pageSize: number = 10): Promise<FeedResponse> => {
  const response = await api.get<FeedResponse>('/api/post/posts', {
    params: { page, pageSize },
  });
  return response.data;
};

// 搜索帖子（如果后端没有搜索接口，暂时使用 getFeed）
export const searchPosts = async (keyword: string): Promise<FeedResponse> => {
  // TODO: 后端需要实现搜索接口 GET /api/post/posts/search?keyword=xxx
  // 暂时使用 getFeed，后续需要替换为真正的搜索接口
  if (!keyword || keyword.trim() === '') {
    return getFeed(1, 10);
  }
  // 临时方案：调用搜索接口（如果后端已实现）
  try {
    const response = await api.get<FeedResponse>('/api/post/posts/search', {
      params: { keyword: keyword.trim() },
    });
    return response.data;
  } catch (error) {
    // 如果搜索接口不存在，返回空结果
    return {
      code: 0,
      message: '搜索功能待实现',
      data: {
        items: [], // 使用 items 字段，与后端保持一致
        page: 1,
        pageSize: 10,
        total: 0,
      },
    };
  }
};

// 获取帖子详情
export const getPostDetail = async (id: number): Promise<PostDetailResponse> => {
  const response = await api.get<PostDetailResponse>(`/api/post/posts/${id}`);
  return response.data;
};

