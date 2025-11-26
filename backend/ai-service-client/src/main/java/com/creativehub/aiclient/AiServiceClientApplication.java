package com.creativehub.aiclient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AiServiceClientApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiServiceClientApplication.class, args);
    }
}
