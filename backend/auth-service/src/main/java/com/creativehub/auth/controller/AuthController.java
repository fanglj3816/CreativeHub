package com.creativehub.auth.controller;

import com.creativehub.auth.dto.ApiResponse;
import com.creativehub.auth.dto.LoginRequest;
import com.creativehub.auth.dto.LoginResponse;
import com.creativehub.auth.dto.RegisterRequest;
import com.creativehub.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("注册成功", null));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("邮箱已存在")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(1001, "邮箱已存在"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(1000, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("用户不存在")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(1002, "用户不存在或密码错误"));
            } else if (e.getMessage().contains("密码错误")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(1002, "用户不存在或密码错误"));
            } else if (e.getMessage().contains("账号已被禁用")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(1003, "账号已被禁用"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(1000, e.getMessage()));
        }
    }
}

















