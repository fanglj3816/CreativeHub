package com.creativehub.auth.service.impl;

import com.creativehub.auth.dto.AlmanacDTO;
import com.creativehub.auth.dto.WeatherNowDTO;
import com.creativehub.auth.entity.UserAccount;
import com.creativehub.auth.service.QuoteService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuoteServiceImpl implements QuoteService {

    private final List<String> baseQuotes = new ArrayList<>(); // 启动时从 resources/quotes.txt 读入（或写死在代码里）

    @PostConstruct
    public void init()  {

        // 如果没有成功加载，则加入一些默认语句避免空集合
        if (baseQuotes.isEmpty()) {
            baseQuotes.addAll(List.of(
                    "生活就像海洋，只有意志坚强的人才能到达彼岸。",
                    "创意源于点滴积累，坚持成就非凡作品。",
                    "今天的努力，是为了明天更好的自己。"
            ));
        }
    }

    @Override
    public String getTodayQuote(UserAccount user, WeatherNowDTO weather, AlmanacDTO almanac) {


        LocalDate today = LocalDate.now(ZoneId.of("Asia/Shanghai"));
        String seed = today + ":" + user.getUsername();

        int idx = Math.floorMod(seed.hashCode(), baseQuotes.size());
        String base = baseQuotes.get(idx);

        // 轻增强：根据天气/宜忌拼接一句尾巴（可选）
        String tail = "";
        if (weather != null && weather.getText() != null) {
            if (weather.getText().contains("雨")) tail = "记得带伞，适合在室内剪辑/整理素材。";
            else if (weather.getText().contains("晴")) tail = "光线不错，适合外出拍点素材。";
        }

        // 再轻增强：如果“宜”里包含某些关键词
        if (almanac != null && almanac.getYi() != null && almanac.getYi().contains("出行")) {
            tail = tail.isEmpty() ? "今天宜出行，换个地方找灵感。" : tail;
        }

        return tail.isEmpty() ? base : (base + " " + tail);
    }
}
