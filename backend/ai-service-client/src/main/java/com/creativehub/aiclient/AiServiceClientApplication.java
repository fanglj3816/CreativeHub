package com.creativehub.aiclient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.creativehub.aiclient")
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.creativehub.aiclient.client")
@EnableJpaRepositories(basePackages = "com.creativehub.aiclient.repository")
@EntityScan(basePackages = "com.creativehub.aiclient.entity")
@EnableScheduling
public class AiServiceClientApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiServiceClientApplication.class, args);
    }
}
