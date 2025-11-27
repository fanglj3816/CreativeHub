import axios from 'axios';

// 创建独立的 axios 实例用于地址 API（不需要 token）
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChinaArea {
  id: string;
  parentId: string | null;
  name: string;
  level: number;
}

export const getProvinces = async (): Promise<ChinaArea[]> => {
  try {
    const response = await api.get<{ code: number; message: string; data: ChinaArea[] }>('/api/area/provinces');
    console.log('获取省份响应:', response);
    if (response.data && response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    console.warn('省份数据格式异常:', response.data);
    return [];
  } catch (error: any) {
    console.error('获取省份列表失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return [];
  }
};

export const getCities = async (provinceId: string): Promise<ChinaArea[]> => {
  try {
    const response = await api.get<{ code: number; message: string; data: ChinaArea[] }>(`/api/area/cities/${provinceId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取城市列表失败:', error);
    return [];
  }
};

export const getDistricts = async (cityId: string): Promise<ChinaArea[]> => {
  try {
    const response = await api.get<{ code: number; message: string; data: ChinaArea[] }>(`/api/area/districts/${cityId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取区县列表失败:', error);
    return [];
  }
};

