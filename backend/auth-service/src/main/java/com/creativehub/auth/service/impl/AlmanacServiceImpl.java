package com.creativehub.auth.service.impl;

import com.creativehub.auth.dto.AlmanacDTO;
import com.creativehub.auth.service.AlmanacService;
import com.nlf.calendar.Lunar;
import com.nlf.calendar.Solar;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class AlmanacServiceImpl implements AlmanacService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");

    @Override
    public AlmanacDTO getToday() {

        LocalDate today = LocalDate.now(ZONE);

        Solar solar = Solar.fromYmd(today.getYear(), today.getMonthValue(), today.getDayOfMonth());

        Lunar lunar = solar.getLunar();
        AlmanacDTO dto = new AlmanacDTO();
        dto.setDate(String.format("%d年%02d月%02d日", today.getYear(), today.getMonthValue(), today.getDayOfMonth()));
        dto.setWeekday("星期" + solar.getWeekInChinese()); // 一/二/三...

        // 你想要更简洁：乙巳年 冬月十九（示例）
        String lunarText = lunar.getYearInGanZhi() + "年 " + lunar.getMonthInChinese() + "月" + lunar.getDayInChinese();
        dto.setLunarText(lunarText);

        // 宜忌（方法名按 1.7.7 可用；如果你版本不同，以IDE提示为准）
        List<String> yi = lunar.getDayYi();
        List<String> ji = lunar.getDayJi();
        dto.setYi(yi == null ? List.of() : yi);
        dto.setJi(ji == null ? List.of() : ji);

        return dto;
    }
}
