import api from './auth';
import type { SidePanelDTO } from '../types/sidePanel';

/**
 * 获取侧边栏面板数据
 * @returns Promise<SidePanelDTO>
 * @throws 401/403 时抛出 "UNAUTHORIZED" 错误
 */
export async function fetchSidePanel(): Promise<SidePanelDTO> {
  try {
    const response = await api.get<SidePanelDTO>('/api/auth/side/panel');
    return response.data;
  } catch (error: any) {
    // 处理 401/403 错误
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('UNAUTHORIZED');
    }
    // 其他错误继续抛出
    throw error;
  }
}

