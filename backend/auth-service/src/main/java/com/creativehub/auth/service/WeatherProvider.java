package com.creativehub.auth.service;

import com.creativehub.auth.dto.WeatherNowDTO;

public interface WeatherProvider {

    String lookupLocationId(String city);

    WeatherNowDTO fetchNowByLocationId(String locationId);
}
