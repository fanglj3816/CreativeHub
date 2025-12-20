package com.creativehub.auth.service.impl;

import com.creativehub.auth.dto.QWeatherNowResponse;
import com.creativehub.auth.dto.WeatherNowDTO;
import com.creativehub.auth.service.WeatherProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.GZIPInputStream;


@Service
public class WeatherProviderServiceImpl implements WeatherProvider {



    @Value("${qweather.host}")
    private String host;

    @Value("${qweather.lang:zh}")
    private String lang;

    @Value("${qweather.unit:m}")
    private String unit;

    @Value("${qweather.apiKey:}")
    private String apiKey;

    // JWT 相关（当 apiKey 为空时启用）
/*    @Value("${qweather.keyId:}")
    private String keyId;

    @Value("${qweather.projectId:}")
    private String projectId;

    @Value("${qweather.privateKeyPem:}")
    private String privateKeyPem;*/

    // JWT 缓存（token 有效期 15 分钟，这里提前 60 秒刷新）
    private volatile String cachedJwt;
    private volatile long cachedJwtExpEpochSec;

    private final RestTemplate httpClient; // 项目里用的客户端封装

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(WeatherProviderServiceImpl.class);


    public WeatherProviderServiceImpl(RestTemplate httpClient) {
        this.httpClient = httpClient;
    }

    @Override
    @Cacheable(cacheNames = "weather:locId", key = "#city.trim()", unless = "#result == null")
    public String lookupLocationId(String city) {

        logger.info("call lookupLocationId city={}", city);
        try {
            String enCodeCity = URLEncoder.encode(city, StandardCharsets.UTF_8);

            // GeoAPI v2: /geo/v2/city/lookup?location=xxx&lang=zh&number=1
            String url = baseUrl() + "/geo/v2/city/lookup?location=" + enCodeCity  + "&lang=" + lang + "&number=1";

            ResponseEntity<byte[]> response = httpClient.exchange(url, HttpMethod.GET, new HttpEntity<>(buildHeaders()), byte[].class);

            if(!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) return null;

            String json = extractBodyAsUtf8(response);

            JsonNode root = objectMapper.readTree(json);
            if (!"200".equals(root.path("code").asText())) return null;

            // parse: 取第一个 location 的 id
            // return response.location[0].id
            JsonNode locArr = root.path("location");
            if (!locArr.isArray() || locArr.isEmpty()) return null;

            return locArr.get(0).path("id").asText(null);
        } catch (Exception e) {

            logger.error("Failed to lookup locationId: {}", e.getMessage());

            return null;
        }

    }

    @Override
    @Cacheable(cacheNames = "weather:now", key = "#locationId.trim()", unless = "#result == null")
    public WeatherNowDTO fetchNowByLocationId(String locationId) {

        logger.info("call fetchNowByLocationId locationId={}", locationId);
        try {

            // 实时天气: /v7/weather/now?location=101010100&lang=zh&unit=m
            String url = baseUrl() + "/v7/weather/now?location=" + locationId+ "&lang=" + lang + "&unit=" + unit;

            ResponseEntity<byte []> response = httpClient.exchange(url, HttpMethod.GET, new HttpEntity<>(buildHeaders()), byte[].class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) return null;

            String json = extractBodyAsUtf8(response);

            // ✅ 自己用 objectMapper 反序列化，绕开 RestTemplate 的“压缩字节->JSON”问题
            QWeatherNowResponse dto = objectMapper.readValue(json, QWeatherNowResponse.class);

            return dto.getNow();

        } catch (Exception e) {
            logger.error("Failed to fetch weather: {}", e.getMessage());
            return null;
        }
    }

    private HttpHeaders buildHeaders() {

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
       // headers.set("Accept-Encoding", "identity");

        if (apiKey != null && !apiKey.isEmpty()){
            headers.set("X-QW-Api-Key", apiKey.trim());
        }

/*        String jwt = getOrCreateJwt();
        if (jwt != null && !jwt.isBlank()) {
            headers.setBearerAuth(jwt);
        }*/

        return headers;
    }


    // ===== JWT 生成（按官方 Java 示例思路实现）=====
    /*private String getOrCreateJwt() {
        if (keyId == null || keyId.isBlank() ||
                projectId == null || projectId.isBlank() ||
                privateKeyPem == null || privateKeyPem.isBlank()) {
            return null;
        }

        long now = ZonedDateTime.now(ZoneOffset.UTC).toEpochSecond();
        if (cachedJwt != null && (cachedJwtExpEpochSec - now) > 60) {
            return cachedJwt;
        }

        try {
            // 1) 解析 PEM 私钥（PKCS8）
            String pk = privateKeyPem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .trim();
            byte[] privateKeyBytes = Base64.getDecoder().decode(pk);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);

            // Java 15+ 推荐：KeyFactory.getInstance("EdDSA")
            KeyFactory keyFactory = KeyFactory.getInstance("EdDSA");
            PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

            // 2) header/payload（iat -30s, exp +900s）
            long iat = now - 30;
            long exp = iat + 900;
            String headerJson = "{\"alg\":\"EdDSA\",\"kid\":\"" + escapeJson(keyId.trim()) + "\"}";
            String payloadJson = "{\"sub\":\"" + escapeJson(projectId.trim()) + "\",\"iat\":" + iat + ",\"exp\":" + exp + "}";

            String headerEncoded = b64UrlNoPad(headerJson.getBytes(StandardCharsets.UTF_8));
            String payloadEncoded = b64UrlNoPad(payloadJson.getBytes(StandardCharsets.UTF_8));
            String data = headerEncoded + "." + payloadEncoded;

            // 3) EdDSA 签名
            Signature signer = Signature.getInstance("EdDSA");
            signer.initSign(privateKey);
            signer.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] signature = signer.sign();

            String sigEncoded = b64UrlNoPad(signature);
            String jwt = data + "." + sigEncoded;

            cachedJwt = jwt;
            cachedJwtExpEpochSec = exp;
            return jwt;
        } catch (Exception e) {
            return null;
        }
    }*/

    private static String b64UrlNoPad(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
    private String extractBodyAsUtf8(ResponseEntity<byte[]> resp) throws IOException {
        byte[] body = resp.getBody();
        if (body == null || body.length == 0) return null;

        boolean gzip = false;

        // 1) 先看响应头 Content-Encoding
        String ce = resp.getHeaders().getFirst(HttpHeaders.CONTENT_ENCODING);
        if (ce != null && ce.toLowerCase().contains("gzip")) {
            gzip = true;
        }

        // 2) 再用 gzip 魔数兜底：1F 8B
        if (!gzip && body.length >= 2) {
            gzip = (body[0] == (byte) 0x1f && body[1] == (byte) 0x8b);
        }

        InputStream in = new ByteArrayInputStream(body);
        if (gzip) {
            in = new GZIPInputStream(in);
        }

        // Java 9+：readAllBytes
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }



    private String baseUrl() {
        String h = Objects.requireNonNull(host).trim();
        if (h.startsWith("http://") || h.startsWith("https://")) return h;
        return "https://" + h;
    }


}
