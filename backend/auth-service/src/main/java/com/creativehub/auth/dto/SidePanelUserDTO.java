package com.creativehub.auth.dto;

import com.creativehub.auth.entity.UserAccount;
import lombok.Data;

@Data
public class SidePanelUserDTO {

    private Long id;
    private String username;
    private String email;
    private String city;
    // 你后续如果有 avatarUrl / city 等字段，再加在这里（不要把 entity 整个塞进来）

    public static SidePanelUserDTO from(UserAccount u) {
        if (u == null) return null;
        SidePanelUserDTO dto = new SidePanelUserDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());

        if(!u.getAddresses().isEmpty()){
            dto.setCity(u.getAddresses().get(0).getCity());
        }
        return dto;
    }
}