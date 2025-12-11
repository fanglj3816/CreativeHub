import api from './auth';

// 任务状态类型
export interface TaskStatus {
  id: number;
  userId: number;
  taskType: string;
  status: number; // 0=待处理 1=处理中 2=成功 3=失败
  progress: number; // 0-100
  inputFile: string;
  resultJson: string | null; // JSON 字符串
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// 人声分离结果
export interface VocalResult {
  vocal: string; // 人声音频文件路径
  instrumental: string; // 伴奏音频文件路径
}

// 创建任务请求
export interface CreateVocalTaskRequest {
  fileId: number;
  options: {
    model: 'UVR-MDX' | 'UVR-Karaoke';
    outputFormat: 'WAV' | 'FLAC';
  };
}

// 创建任务响应
export interface CreateVocalTaskResponse {
  code: number;
  message: string;
  data: {
    taskId: number;
  };
}

// 获取任务详情响应
export interface GetTaskDetailResponse {
  code: number;
  message: string;
  data: TaskStatus;
}

/**
 * 创建人声分离任务
 */
export const createVocalTask = async (
  request: CreateVocalTaskRequest
): Promise<CreateVocalTaskResponse> => {
  const response = await api.post<CreateVocalTaskResponse>('/api/audio/vocal/task', request);
  return response.data;
};

/**
 * 获取任务详情
 */
export const getTaskDetail = async (taskId: number): Promise<GetTaskDetailResponse> => {
  const response = await api.get<GetTaskDetailResponse>(`/api/audio/task/${taskId}`);
  return response.data;
};

/**
 * 解析任务结果 JSON
 */
export const parseTaskResult = (resultJson: string | null): VocalResult => {
  if (!resultJson) {
    throw new Error('任务结果为空');
  }

  try {
    const result = JSON.parse(resultJson);
    return {
      vocal: result.vocal || result.vocalPath || '',
      instrumental: result.instrumental || result.instrumentalPath || '',
    };
  } catch (error) {
    console.error('解析任务结果失败:', error);
    throw new Error('解析任务结果失败');
  }
};

// 分离结果轨道信息
export interface TrackInfo {
  name: string;
  url: string;
  description?: string;
}

// 分离响应
export interface SeparationResponse {
  code: number;
  message: string;
  taskId?: number; // 任务ID
  data?: {
    tracks?: TrackInfo[]; // 兼容旧格式（如果有）
  };
}

// 分离请求参数
export interface SeparationRequest {
  mediaId: number;
}

/**
 * 执行人声分离
 * @param mediaId 音频文件的媒体ID
 * @returns 返回 taskId
 */
export const separateVocal = async (mediaId: number): Promise<SeparationResponse> => {
  const requestBody: SeparationRequest = {
    mediaId,
  };

  const response = await api.post<SeparationResponse>('/api/audio/separation/vocal', requestBody);
  return response.data;
};

/**
 * 执行 4 轨分离
 * @param mediaId 音频文件的媒体ID
 * @returns 返回 taskId
 */
export const separateDemucs4 = async (mediaId: number): Promise<SeparationResponse> => {
  const requestBody: SeparationRequest = {
    mediaId,
  };

  const response = await api.post<SeparationResponse>('/api/audio/separation/stem4', requestBody);
  return response.data;
};

/**
 * 执行 6 轨分离
 * @param mediaId 音频文件的媒体ID
 * @returns 返回 taskId
 */
export const separateDemucs6 = async (mediaId: number): Promise<SeparationResponse> => {
  const requestBody: SeparationRequest = {
    mediaId,
  };

  const response = await api.post<SeparationResponse>('/api/audio/separation/stem6', requestBody);
  return response.data;
};

// 任务状态响应（对应后端 TaskStatusResponse）
export interface TaskStatusResponse {
  code?: number;
  message?: string;
  taskId: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progress: number; // 0-100
  vocalUrl?: string; // 人声分离时的人声 URL
  instUrl?: string; // 人声分离时的伴奏 URL
  trackUrls?: string[]; // 多轨分离时的各轨 URL 列表
  errorMsg?: string; // 错误信息
}

/**
 * 查询任务状态
 * @param taskId 任务ID
 * @returns 任务状态信息
 */
export const getTaskStatus = async (taskId: number): Promise<TaskStatusResponse> => {
  const response = await api.get<TaskStatusResponse>(`/api/audio/task/${taskId}`);
  return response.data;
};
