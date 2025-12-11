package com.creativehub.auth.service;

import com.creativehub.auth.entity.ChinaArea;
import com.creativehub.auth.repository.ChinaAreaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AreaService {

    private final ChinaAreaRepository chinaAreaRepository;

    public AreaService(ChinaAreaRepository chinaAreaRepository) {
        this.chinaAreaRepository = chinaAreaRepository;
    }

    // 获取所有省份（level = 1）
    public List<ChinaArea> getProvinces() {
        return chinaAreaRepository.findByLevel(1);
    }

    // 根据省份ID获取城市（level = 2）
    public List<ChinaArea> getCitiesByProvinceId(String provinceId) {
        return chinaAreaRepository.findByParentIdAndLevel(provinceId, 2);
    }

    // 根据城市ID获取区县（level = 3）
    public List<ChinaArea> getDistrictsByCityId(String cityId) {
        return chinaAreaRepository.findByParentIdAndLevel(cityId, 3);
    }
}














