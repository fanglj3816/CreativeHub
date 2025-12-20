package com.creativehub.auth.service;

import com.creativehub.auth.dto.SidePanelDTO;

public interface SidePanelService {
    SidePanelDTO getForCurrentUser(Long userId);
}
