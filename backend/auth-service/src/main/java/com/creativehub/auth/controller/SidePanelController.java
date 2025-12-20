package com.creativehub.auth.controller;

import com.creativehub.auth.dto.SidePanelDTO;
import com.creativehub.auth.security.UserPrincipal;
import com.creativehub.auth.service.SidePanelService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/side")
public class SidePanelController {

    private final SidePanelService sidePanelService;

    public SidePanelController(SidePanelService sidePanelService) {
        this.sidePanelService = sidePanelService;
    }

    @GetMapping("/panel")
    public SidePanelDTO getForCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return sidePanelService.getForCurrentUser(principal.getUserId());
    }



}
