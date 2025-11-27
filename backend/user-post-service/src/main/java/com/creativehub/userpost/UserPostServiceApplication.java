package com.creativehub.userpost;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.creativehub.userpost.client")
public class UserPostServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserPostServiceApplication.class, args);
    }
}
