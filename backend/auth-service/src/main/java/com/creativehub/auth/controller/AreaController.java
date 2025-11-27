package com.creativehub.auth.controller;

import com.creativehub.auth.dto.ApiResponse;
import com.creativehub.auth.entity.ChinaArea;
import com.creativehub.auth.service.AreaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 地址查询控制器
 * 
 * 注意：CORS 配置已在 Gateway 层统一处理（GlobalCorsConfig）
 * @CrossOrigin 注解对 Spring Cloud Gateway 无效，因为请求先经过 Gateway
 */
@RestController
@RequestMapping("/area")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    // 获取所有省份
    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<List<ChinaArea>>> getProvinces() {
        List<ChinaArea> provinces = areaService.getProvinces();
        return ResponseEntity.ok(ApiResponse.success("获取成功", provinces));
    }

    // 根据省份ID获取城市
    @GetMapping("/cities/{provinceId}")
    public ResponseEntity<ApiResponse<List<ChinaArea>>> getCities(@PathVariable String provinceId) {
        List<ChinaArea> cities = areaService.getCitiesByProvinceId(provinceId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", cities));
    }

    // 根据城市ID获取区县
    @GetMapping("/districts/{cityId}")
    public ResponseEntity<ApiResponse<List<ChinaArea>>> getDistricts(@PathVariable String cityId) {
        List<ChinaArea> districts = areaService.getDistrictsByCityId(cityId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", districts));
    }
}

