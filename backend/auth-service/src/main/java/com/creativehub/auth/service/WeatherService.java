package com.creativehub.auth.service;

import com.creativehub.auth.dto.WeatherNowDTO;

public interface WeatherService {

    // city 可以是 "杭州" / "杭州市" / "330100"（看你存啥）
    public WeatherNowDTO getNow(String city);

}
