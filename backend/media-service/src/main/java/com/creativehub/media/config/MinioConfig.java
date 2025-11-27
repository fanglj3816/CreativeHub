package com.creativehub.media.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MinioProperties.class)
public class MinioConfig {

    private static final Logger log = LoggerFactory.getLogger(MinioConfig.class);
    private final MinioProperties properties;

    public MinioConfig(MinioProperties properties) {
        this.properties = properties;
    }

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
            .endpoint(properties.getEndpoint())
            .credentials(properties.getAccessKey(), properties.getSecretKey())
            .build();
        ensureBucket(client);
        return client;
    }

    private void ensureBucket(MinioClient client) {
        try {
            boolean exist = client.bucketExists(BucketExistsArgs.builder()
                .bucket(properties.getBucket())
                .build());
            if (!exist) {
                client.makeBucket(MakeBucketArgs.builder()
                    .bucket(properties.getBucket())
                    .build());
                log.info("MinIO bucket {} created automatically.", properties.getBucket());
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to ensure MinIO bucket: " + ex.getMessage(), ex);
        }
    }
}


