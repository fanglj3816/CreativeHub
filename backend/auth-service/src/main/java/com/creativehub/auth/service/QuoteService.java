package com.creativehub.auth.service;

import com.creativehub.auth.dto.AlmanacDTO;
import com.creativehub.auth.dto.WeatherNowDTO;
import com.creativehub.auth.entity.UserAccount;

public interface QuoteService {

    String getTodayQuote(UserAccount user, WeatherNowDTO weather, AlmanacDTO almanac);

}
