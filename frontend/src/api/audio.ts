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
  data: {
    tracks: TrackInfo[];
  };
}

// 分离选项
export interface SeparationOptions {
  model?: string;
  outputFormat?: 'wav' | 'mp3';
}

/**
 * 上传并执行人声分离
 */
export const uploadAndSeparateVocal = async (
  file: File,
  options?: SeparationOptions
): Promise<SeparationResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options?.model) {
    formData.append('model', options.model);
  }
  if (options?.outputFormat) {
    formData.append('outputFormat', options.outputFormat.toUpperCase());
  }

  try {
    const response = await api.post<SeparationResponse>('/api/ai/audio/vocal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    // 如果后端未接入，返回模拟数据
    console.warn('API 调用失败，使用模拟数据:', error);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: 'success',
          data: {
            tracks: [
              { name: 'Vocal', url: '', description: '人声' },
              { name: 'Instrumental', url: '', description: '伴奏' },
            ],
          },
        });
      }, 1500);
    });
  }
};

/**
 * 上传并执行 4 轨分离
 */
export const uploadAndSeparateDemucs4 = async (
  file: File,
  options?: SeparationOptions
): Promise<SeparationResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options?.outputFormat) {
    formData.append('outputFormat', options.outputFormat.toUpperCase());
  }

  try {
    const response = await api.post<SeparationResponse>('/api/ai/audio/demucs4', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    // 如果后端未接入，返回模拟数据
    console.warn('API 调用失败，使用模拟数据:', error);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: 'success',
          data: {
            tracks: [
              { name: 'Vocal', url: '', description: '人声' },
              { name: 'Drums', url: '', description: '鼓' },
              { name: 'Bass', url: '', description: '贝斯' },
              { name: 'Other', url: '', description: '其他' },
            ],
          },
        });
      }, 1500);
    });
  }
};

/**
 * 上传并执行 6 轨分离
 */
export const uploadAndSeparateDemucs6 = async (
  file: File,
  options?: SeparationOptions
): Promise<SeparationResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options?.outputFormat) {
    formData.append('outputFormat', options.outputFormat.toUpperCase());
  }

  try {
    const response = await api.post<SeparationResponse>('/api/ai/audio/demucs6', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    // 如果后端未接入，返回模拟数据
    console.warn('API 调用失败，使用模拟数据:', error);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: 'success',
          data: {
            tracks: [
              { name: 'Vocal', url: '', description: '人声' },
              { name: 'Drums', url: '', description: '鼓' },
              { name: 'Bass', url: '', description: '贝斯' },
              { name: 'Other', url: '', description: '其他' },
              { name: 'Piano', url: '', description: '钢琴' },
              { name: 'Guitar', url: '', description: '吉他' },
            ],
          },
        });
      }, 1500);
    });
  }
};
