package com.creativehub.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * 全局 CORS 配置类
 * 
 * 重要说明：
 * 1. Spring Cloud Gateway 基于 WebFlux（响应式编程），不是传统的 Spring MVC
 * 2. 因此必须使用 WebFlux 的 CorsWebFilter，而不是 MVC 的 CorsFilter
 * 3. @CrossOrigin 注解和 SecurityConfig 中的 cors() 配置对 Gateway 无效
 * 4. 所有请求都先经过 Gateway，因此必须在 Gateway 层统一处理 CORS
 * 
 * 配置生效原理：
 * - CorsWebFilter 是 WebFlux 的过滤器，会在请求进入 Gateway 路由之前处理 CORS
 * - 通过 UrlBasedCorsConfigurationSource 注册到所有路径（/**）
 * - 对 OPTIONS 预检请求和实际请求都会添加正确的 CORS 响应头
 */
@Configuration
public class GlobalCorsConfig {

    /**
     * 创建全局 CORS 过滤器
     * 
     * 此 Bean 会被 Spring Cloud Gateway 自动识别并应用到所有请求
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // 1. 允许的来源（开发环境）
        // 注意：当 allowCredentials 为 true 时，不能使用 "*"，必须明确指定来源
        corsConfig.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ));
        
        // 2. 允许所有请求方法
        corsConfig.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // 3. 允许所有请求头
        // 注意：虽然可以使用 "*"，但为了明确性和兼容性，我们列出常用头
        // 特别是 Authorization 头，用于 JWT 认证
        corsConfig.setAllowedHeaders(Arrays.asList(
            "*",  // 允许所有头
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // 4. 允许暴露的响应头（前端可以访问的响应头）
        corsConfig.setExposedHeaders(Arrays.asList(
            "Content-Type",
            "Authorization",
            "X-Total-Count",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        // 5. 允许携带凭证（Cookie、Authorization 等）
        // 这是关键配置，允许前端发送认证信息
        corsConfig.setAllowCredentials(true);
        
        // 6. 预检请求的缓存时间（秒）
        // 浏览器会在指定时间内缓存 OPTIONS 预检请求的结果
        corsConfig.setMaxAge(3600L);
        
        // 7. 创建基于 URL 的 CORS 配置源
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // 8. 对所有路径应用 CORS 配置
        // 这是关键：确保所有经过 Gateway 的请求都应用 CORS 规则
        source.registerCorsConfiguration("/**", corsConfig);
        
        // 9. 返回 WebFlux 的 CORS 过滤器
        // 此过滤器会在请求处理链的早期阶段处理 CORS
        return new CorsWebFilter(source);
    }
}




