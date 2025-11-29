import type { PostDTO } from '../api/post';

// 格式化时间戳为相对时间
export const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
};

// 将后端 PostDTO 转换为 FeedCard 所需的格式
export const formatPostForFeedCard = (post: PostDTO) => {
  // 处理媒体列表：取第一个媒体作为主要媒体
  let media: {
    type: 'image' | 'video' | 'audio';
    url?: string | null;
    thumbnail?: string;
    fileName?: string; // 音频文件名
    status?: number; // 0=完成 1=处理中 2=失败
    progress?: number; // 0~1
    errorMsg?: string | null;
  } | undefined;

  if (post.mediaList && post.mediaList.length > 0) {
    const firstMedia = post.mediaList[0];
    const fileType = firstMedia.fileType?.toUpperCase();
    
    // 确保 URL 存在且有效
    if (!firstMedia.url) {
      console.warn('formatPostForFeedCard: 媒体 URL 为空', { postId: post.id, media: firstMedia });
    } else {
      if (fileType === 'IMAGE') {
        media = {
          type: 'image',
          url: firstMedia.url,
        };
      } else if (fileType === 'VIDEO') {
        media = {
          type: 'video',
          url: firstMedia.url || null,
          // 不设置 thumbnail，让浏览器自动显示视频第一帧作为预览
          // 如果后端将来提供单独的封面图，可以在这里设置
          thumbnail: undefined,
          status: firstMedia.status,
          progress: firstMedia.progress ? Number(firstMedia.progress) : undefined,
          errorMsg: firstMedia.errorMsg || null,
        };
      } else if (fileType === 'AUDIO') {
        media = {
          type: 'audio',
          url: firstMedia.url,
          fileName: firstMedia.displayName || undefined, // 传递显示名称
        };
      }
    }
  } else {
    // 调试：如果帖子有内容但没有媒体，记录日志
    if (post.content) {
      console.debug('formatPostForFeedCard: 帖子没有媒体列表', { postId: post.id, content: post.content });
    }
  }

  return {
    id: post.id,
    author: {
      name: post.author?.nickname || `用户${post.author?.id || '未知'}`,
      avatar: post.author?.avatar || '👤',
      verified: false, // 可以根据实际需求判断
    },
    content: {
      text: post.content || '',
      media,
    },
    stats: {
      likes: 0, // 后端暂未返回，使用默认值
      comments: 0,
      shares: 0,
    },
    timestamp: formatTimestamp(post.createdAt),
  };
};

