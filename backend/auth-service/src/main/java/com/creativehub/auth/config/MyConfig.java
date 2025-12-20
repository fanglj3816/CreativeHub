package com.creativehub.auth.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

@Configuration
public class MyConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10秒连接超时
        factory.setReadTimeout(1800000); // 30分钟读取超时（音频处理可能需要较长时间）
        return new RestTemplate(factory);
    }

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();

        CaffeineCache locIdCache = new CaffeineCache(
                "weather:locId",
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofDays(7))
                        .maximumSize(10_000)
                        .build()
        );

        CaffeineCache nowCache = new CaffeineCache(
                "weather:now",
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofMinutes(10))
                        .maximumSize(50_000)
                        .build()
        );

        manager.setCaches(List.of(locIdCache, nowCache));
        return manager;
    }

}
