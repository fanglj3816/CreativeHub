package com.creativehub.auth.service.impl;

import com.creativehub.auth.dto.AlmanacDTO;
import com.creativehub.auth.dto.SidePanelDTO;
import com.creativehub.auth.dto.SidePanelUserDTO;
import com.creativehub.auth.dto.WeatherNowDTO;
import com.creativehub.auth.entity.UserAccount;
import com.creativehub.auth.repository.UserAccountRepository;
import com.creativehub.auth.service.QuoteService;
import com.creativehub.auth.service.SidePanelService;
import com.creativehub.auth.service.WeatherService;
import org.springframework.stereotype.Service;

@Service
public class SidePanelServiceImpl implements SidePanelService {

    private final UserAccountRepository userRepo;
    private final WeatherService weatherService;
    private final AlmanacServiceImpl almanacService;
    private final QuoteService quoteService;

    public SidePanelServiceImpl(UserAccountRepository userRepo, WeatherService weatherService, AlmanacServiceImpl almanacService, QuoteService quoteService) {
        this.userRepo = userRepo;
        this.weatherService = weatherService;
        this.almanacService = almanacService;
        this.quoteService = quoteService;
    }

    @Override
    public SidePanelDTO getForCurrentUser(Long userId) {
        UserAccount user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        WeatherNowDTO weather = weatherService.getNow(user.getAddresses().get(0).getCity());
        AlmanacDTO almanac = almanacService.getToday();
        String quote = quoteService.getTodayQuote(user,weather, almanac);

        SidePanelDTO dto = new SidePanelDTO();
        dto.setUser(SidePanelUserDTO.from( user));
        dto.setWeather(weather);
        dto.setAlmanac(almanac);
        dto.setQuote(quote);
        return dto;
    }
}
