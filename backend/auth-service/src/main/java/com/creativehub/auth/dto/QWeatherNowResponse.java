package com.creativehub.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class QWeatherNowResponse {

    private String code;

    private String updateTime;

    private String fxLink;

    private WeatherNowDTO now;

}
