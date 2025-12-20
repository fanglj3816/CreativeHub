package com.creativehub.auth.dto;

import lombok.Data;

import java.util.List;

@Data
public class AlmanacDTO {
    private String date;      // 2025-12-19
    private String weekday;   // 星期五
    private String lunarText; // 乙巳年 冬月十九（示例）
    private List<String> yi;
    private List<String> ji;
}
