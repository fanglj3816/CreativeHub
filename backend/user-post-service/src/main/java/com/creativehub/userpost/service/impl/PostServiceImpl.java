package com.creativehub.userpost.service.impl;

import com.creativehub.userpost.client.MediaClient;
import com.creativehub.userpost.dto.ApiResponse;
import com.creativehub.userpost.dto.AuthorDTO;
import com.creativehub.userpost.dto.CreatePostRequest;
import com.creativehub.userpost.dto.MediaDTO;
import com.creativehub.userpost.dto.MediaItemDTO;
import com.creativehub.userpost.dto.PostDTO;
import com.creativehub.userpost.entity.Post;
import com.creativehub.userpost.entity.PostMedia;
import com.creativehub.userpost.entity.UserProfile;
import com.creativehub.userpost.exception.PostNotFoundException;
import com.creativehub.userpost.exception.PostServiceException;
import com.creativehub.userpost.exception.RemoteServiceException;
import com.creativehub.userpost.repository.PostMediaRepository;
import com.creativehub.userpost.repository.PostRepository;
import com.creativehub.userpost.repository.UserProfileRepository;
import com.creativehub.userpost.service.PostService;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final MediaClient mediaClient;
    private final UserProfileRepository userProfileRepository;

    public PostServiceImpl(PostRepository postRepository,
                           PostMediaRepository postMediaRepository,
                           MediaClient mediaClient,
                           UserProfileRepository userProfileRepository) {
        this.postRepository = postRepository;
        this.postMediaRepository = postMediaRepository;
        this.mediaClient = mediaClient;
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    @Transactional
    public Long createPost(CreatePostRequest request, Long userId) {
        // 验证：content 和 mediaItems 至少有一个不为空
        String content = request.getContent();
        boolean hasContent = content != null && !content.trim().isEmpty();
        boolean hasMedia = !CollectionUtils.isEmpty(request.getMediaItems());
        if (!hasContent && !hasMedia) {
            throw new PostServiceException(400, "帖子内容或媒体文件至少需要提供一个");
        }

        Post post = new Post();
        post.setAuthorId(userId);
        post.setContent(content != null ? content.trim() : null);
        post.setContentType(request.getContentType());
        Post saved = postRepository.save(post);

        List<MediaItemDTO> mediaItems = request.getMediaItems();
        if (!CollectionUtils.isEmpty(mediaItems)) {
            List<PostMedia> postMediaList = new ArrayList<>();
            for (MediaItemDTO mediaItem : mediaItems) {
                PostMedia postMedia = new PostMedia();
                postMedia.setPostId(saved.getId());
                postMedia.setMediaId(mediaItem.getMediaId());
                postMedia.setUsageType(mediaItem.getType());
                postMedia.setSortOrder(mediaItem.getSortOrder());
                postMediaList.add(postMedia);
            }
            postMediaRepository.saveAll(postMediaList);
        }
        return saved.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public PostDTO getPostDetail(Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException(postId));
        List<PostMedia> mediaList = postMediaRepository.findByPostId(postId);
        Map<Long, MediaDTO> mediaMap = fetchMediaMap(mediaList.stream()
            .map(PostMedia::getMediaId)
            .collect(Collectors.toSet()));
        return buildPostDTO(post, mediaList, mediaMap);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDTO> getFeed(int page, int pageSize) {
        int safePage = Math.max(page - 1, 0);
        int safePageSize = Math.max(1, Math.min(pageSize, 50));
        Pageable pageable = PageRequest.of(safePage, safePageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postPage = postRepository.findAll(pageable);
        if (postPage.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        List<Long> postIds = postPage.stream().map(Post::getId).toList();
        List<PostMedia> postMediaList = postMediaRepository.findByPostIdIn(postIds);
        Map<Long, List<PostMedia>> mediaByPost = postMediaList.stream()
            .collect(Collectors.groupingBy(PostMedia::getPostId));
        Set<Long> mediaIds = postMediaList.stream()
            .map(PostMedia::getMediaId)
            .collect(Collectors.toSet());
        Map<Long, MediaDTO> mediaMap = fetchMediaMap(mediaIds);
        List<PostDTO> dtoList = postPage.stream()
            .map(post -> buildPostDTO(post,
                mediaByPost.getOrDefault(post.getId(), Collections.emptyList()),
                mediaMap))
            .toList();
        return new PageImpl<>(dtoList, pageable, postPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDTO> searchPosts(String keyword, int page, int pageSize) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // 如果关键词为空，返回空结果
            return new PageImpl<>(Collections.emptyList(), PageRequest.of(0, pageSize), 0);
        }
        
        int safePage = Math.max(page - 1, 0);
        int safePageSize = Math.max(1, Math.min(pageSize, 50));
        Pageable pageable = PageRequest.of(safePage, safePageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // 根据内容搜索帖子
        Page<Post> postPage = postRepository.searchByContent(keyword.trim(), pageable);
        if (postPage.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        
        List<Long> postIds = postPage.stream().map(Post::getId).toList();
        List<PostMedia> postMediaList = postMediaRepository.findByPostIdIn(postIds);
        Map<Long, List<PostMedia>> mediaByPost = postMediaList.stream()
            .collect(Collectors.groupingBy(PostMedia::getPostId));
        Set<Long> mediaIds = postMediaList.stream()
            .map(PostMedia::getMediaId)
            .collect(Collectors.toSet());
        Map<Long, MediaDTO> mediaMap = fetchMediaMap(mediaIds);
        List<PostDTO> dtoList = postPage.stream()
            .map(post -> buildPostDTO(post,
                mediaByPost.getOrDefault(post.getId(), Collections.emptyList()),
                mediaMap))
            .toList();
        return new PageImpl<>(dtoList, pageable, postPage.getTotalElements());
    }

    private Map<Long, MediaDTO> fetchMediaMap(Collection<Long> mediaIds) {
        if (CollectionUtils.isEmpty(mediaIds)) {
            return Collections.emptyMap();
        }
        ApiResponse<List<MediaDTO>> response;
        try {
            // 将 Collection 转换为 List
            List<Long> idList = mediaIds instanceof List ? (List<Long>) mediaIds : new ArrayList<>(mediaIds);
            response = mediaClient.getMediaByIds(idList);
        } catch (Exception ex) {
            throw new RemoteServiceException("调用 media-service 过程中发生异常", ex);
        }
        if (response == null) {
            throw new RemoteServiceException("调用 media-service 失败：返回为空");
        }
        if (!Objects.equals(response.getCode(), 0)) {
            throw new RemoteServiceException("调用 media-service 失败：" + response.getMessage());
        }
        List<MediaDTO> data = response.getData();
        if (CollectionUtils.isEmpty(data)) {
            return Collections.emptyMap();
        }
        return data.stream()
            .filter(item -> item.getId() != null)
            .collect(Collectors.toMap(MediaDTO::getId, Function.identity(), (a, b) -> a));
    }

    private PostDTO buildPostDTO(Post post, Collection<PostMedia> postMediaList, Map<Long, MediaDTO> mediaMap) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setContentType(post.getContentType());
        dto.setAuthor(getAuthor(post.getAuthorId()));
        dto.setCreatedAt(post.getCreatedAt());
        List<MediaDTO> mediaDtos = postMediaList.stream()
            .sorted(Comparator.comparing(pm -> pm.getSortOrder() == null ? 0 : pm.getSortOrder()))
            .map(pm -> mediaMap.get(pm.getMediaId()))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        dto.setMediaList(mediaDtos);
        return dto;
    }

    /**
     * 根据用户 ID 获取作者信息
     * 从 user_profile 表查询真实用户数据
     */
    private AuthorDTO getAuthor(Long authorId) {
        AuthorDTO author = new AuthorDTO();
        author.setId(authorId);
        
        // 从数据库查询用户资料
        Optional<UserProfile> userProfileOpt = userProfileRepository.findByUserId(authorId);
        if (userProfileOpt.isPresent()) {
            UserProfile profile = userProfileOpt.get();
            author.setNickname(profile.getNickname() != null && !profile.getNickname().trim().isEmpty() 
                ? profile.getNickname() 
                : "用户" + authorId);
            author.setAvatar(profile.getAvatarUrl());
        } else {
            // 如果用户资料不存在，使用默认值
            author.setNickname("用户" + authorId);
            author.setAvatar(null); // 前端会使用默认头像
        }
        
        return author;
    }
}


