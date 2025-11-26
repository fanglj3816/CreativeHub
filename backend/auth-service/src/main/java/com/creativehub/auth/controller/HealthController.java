package com.creativehub.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 非常简单的健康检查接口
 * 注意：不要在这里返回复杂对象，避免 Gateway 序列化问题
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> map = new HashMap<>();
        map.put("status", "UP");
        map.put("service", "auth-service");
        return map;
    }
}


