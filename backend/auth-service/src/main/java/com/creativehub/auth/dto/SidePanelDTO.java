package com.creativehub.auth.dto;

import com.creativehub.auth.entity.UserAccount;
import lombok.Data;


@Data
public class SidePanelDTO {
    private SidePanelUserDTO user;
    private WeatherNowDTO weather;
    private AlmanacDTO almanac;
    private String quote;
}
