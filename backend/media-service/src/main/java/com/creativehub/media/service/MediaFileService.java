package com.creativehub.media.service;

import com.creativehub.media.dto.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MediaFileService {

    UploadResponse uploadMedia(MultipartFile file, Long ownerId);
}


