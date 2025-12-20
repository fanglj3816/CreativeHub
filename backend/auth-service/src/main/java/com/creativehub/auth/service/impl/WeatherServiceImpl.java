package com.creativehub.auth.service.impl;

import com.creativehub.auth.dto.WeatherNowDTO;
import com.creativehub.auth.service.WeatherProvider;
import com.creativehub.auth.service.WeatherService;
import org.springframework.stereotype.Service;

/**
 * 依赖：
 * - Spring Web (RestTemplate)
 * - Jackson (ObjectMapper)
 *
 * 调用：
 * - GeoAPI: /geo/v2/city/lookup?location=城市名
 * - 实时天气: /v7/weather/now?location=LocationID
 *
 * 鉴权：
 * - 优先：X-QW-Api-Key: apiKey（如果你配置了 apiKey）
 * - 否则：Authorization: Bearer <JWT>
 */

@Service
public class WeatherServiceImpl implements WeatherService {

    private final WeatherProvider weatherProvider;

    public WeatherServiceImpl(WeatherProvider weatherProvider) {
        this.weatherProvider = weatherProvider;
    }

    @Override
    public WeatherNowDTO getNow(String city) {
        String locationId = weatherProvider.lookupLocationId(city);
        if (locationId == null) return null;
        return weatherProvider.fetchNowByLocationId(locationId);
    }

}
