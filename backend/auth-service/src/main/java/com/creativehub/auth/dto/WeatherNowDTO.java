package com.creativehub.auth.dto;

import lombok.Data;

@Data
/*
 * 实况天气（QWeather v7 /weather/now -> now）
 */
public class WeatherNowDTO {

    /**
     * 数据更新时间（你自己加的字段）
     * - 建议：存服务端获取/缓存写入的时间戳
     * - 单位：epoch 毫秒（ms）
     */
    private Long updatedAt;

    /**
     * 观测时间（气象站/数据源实际观测时间）
     * - 格式：ISO-8601，例如 2025-12-20T13:17+03:00
     * - 用途：告诉用户“这条天气是几点观测的”
     */
    private String obsTime;

    /**
     * 当前气温
     * - 单位：摄氏度/华氏度取决于 unit 参数（你现在 unit=m 通常是摄氏度）
     * - 示例："13"
     */
    private String temp;

    /**
     * 体感温度（考虑风、湿度等因素后的人体感受温度）
     * - 单位：同 temp
     * - 示例："11"
     */
    private String feelsLike;

    /**
     * 天气状况图标代码（用于前端匹配 icon 图片）
     * - 示例："100"（晴）
     * - 用途：前端根据 icon 显示晴/雨/雪等图标
     */
    private String icon;

    /**
     * 天气状况文字描述
     * - 示例："晴"、"多云"、"小雨"
     */
    private String text;

    /**
     * 风向角度
     * - 含义：风吹来的方向，以正北为 0°，顺时针 0~360
     * - 示例："203"
     */
    private String wind360;

    /**
     * 风向文字描述
     * - 示例："西南偏南风"
     */
    private String windDir;

    /**
     * 风力等级（蒲福风级，常见 0~12+）
     * - 示例："2"
     */
    private String windScale;

    /**
     * 风速
     * - 单位：取决于 unit 参数
     *   - unit=m 一般表示公制（km/h 或 m/s，具体以和风接口返回为准）
     * - 示例："7"
     */
    private String windSpeed;

    /**
     * 相对湿度
     * - 单位：百分比（0~100）
     * - 示例："36"
     */
    private String humidity;

    /**
     * 当前小时累计降水量（或短时降水量）
     * - 单位：毫米（mm）
     * - 示例："0.0"
     */
    private String precip;

    /**
     * 大气压强
     * - 单位：百帕（hPa）
     * - 示例："1019"
     */
    private String pressure;

    /**
     * 能见度
     * - 常见单位：公里（km）
     * - 示例："16"
     */
    private String vis;

    /**
     * 云量（0~100）
     * - 含义：天空被云覆盖的比例百分比
     * - 示例："0"
     */
    private String cloud;

    /**
     * 露点温度
     * - 含义：空气在水汽含量不变的情况下冷却到饱和时的温度
     * - 单位：同 temp
     * - 示例："-1"
     */
    private String dew;
}
