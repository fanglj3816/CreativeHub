package com.creativehub.media.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

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
            // 设置 bucket 策略为公开读取
            setBucketPublicReadPolicy(client);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to ensure MinIO bucket: " + ex.getMessage(), ex);
        }
    }

    /**
     * 设置 bucket 为公开读取策略，允许匿名用户读取文件
     */
    private void setBucketPublicReadPolicy(MinioClient client) {
        try {
            String bucketName = properties.getBucket();
            // MinIO bucket policy JSON，允许匿名用户读取所有对象
            String policyJson = String.format(
                "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Principal\": {\n" +
                "        \"AWS\": [\"*\"]\n" +
                "      },\n" +
                "      \"Action\": [\"s3:GetObject\"],\n" +
                "      \"Resource\": [\"arn:aws:s3:::%s/*\"]\n" +
                "    }\n" +
                "  ]\n" +
                "}",
                bucketName
            );

            client.setBucketPolicy(SetBucketPolicyArgs.builder()
                .bucket(bucketName)
                .config(policyJson)
                .build());
            log.info("MinIO bucket {} policy set to public read.", bucketName);
        } catch (Exception ex) {
            // 如果设置策略失败，记录警告但不中断启动
            // 这可能是因为 bucket 已经存在且有其他策略，或者权限不足
            log.warn("Failed to set public read policy for bucket {}: {}. " +
                    "You may need to set it manually in MinIO console.", 
                    properties.getBucket(), ex.getMessage());
        }
    }
}


