import api from './auth';

export interface MediaDTO {
  id: number;
  url?: string | null;
  fileType: string;
  width?: number;
  height?: number;
  durationSec?: number;
  displayName?: string;
  status?: number; // 0=完成 1=处理中 2=失败
  progress?: number; // 0~1
  errorMsg?: string | null;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface UploadResponse {
  code: number;
  message: string;
  data: MediaDTO;
}

/**
 * 上传媒体文件
 * @returns MediaDTO 包含 id/status/progress/url 等信息
 */
export const uploadMedia = async (file: File): Promise<MediaDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<UploadResponse>('/api/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/**
 * 查询媒体文件转码状态（用于轮询）
 */
export const getMediaStatus = async (mediaId: number): Promise<MediaDTO> => {
  const response = await api.get<ApiResponse<MediaDTO>>(`/api/media/status/${mediaId}`);
  return response.data.data;
};

