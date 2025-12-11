package com.creativehub.common.security;

import com.creativehub.common.core.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * 通用 JWT 解析工具，从 Authorization Header 中解析 userId。
 */
@Component
public class JwtUserResolver {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Long resolveUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            throw new UnauthorizedException("缺少或非法的 Authorization Header");
        }
        String token = header.substring(7);
        return parseUserId(token);
    }

    private Long parseUserId(String token) {
        try {
            String[] segments = token.split("\\.");
            if (segments.length < 2) {
                throw new UnauthorizedException("JWT 结构非法");
            }
            byte[] decoded = Base64.getUrlDecoder().decode(segments[1]);
            JsonNode payload = objectMapper.readTree(new String(decoded, StandardCharsets.UTF_8));
            if (payload.has("userId")) {
                return payload.get("userId").asLong();
            }
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (Exception e) {
            throw new UnauthorizedException("无法解析用户身份");
        }
        throw new UnauthorizedException("JWT 中缺少 userId");
    }
}















