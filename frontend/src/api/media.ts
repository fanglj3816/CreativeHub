import api from './auth';

export interface UploadResponse {
  code: number;
  message: string;
  data: {
    id: number;
    url: string;
  };
}

export const uploadMedia = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<UploadResponse>('/api/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

