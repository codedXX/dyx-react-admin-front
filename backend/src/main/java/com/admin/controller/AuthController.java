package com.admin.controller;

import com.admin.dto.ApiResponse;
import com.admin.dto.LoginRequest;
import com.admin.dto.LoginResponse;
import com.admin.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "认证管理", description = "用户登录、登出、获取用户信息等接口")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "通过用户名和密码登录，返回JWT Token")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success(response);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "登出当前用户，前端需清除Token")
    public ApiResponse<Void> logout() {
        // 简化处理：前端清除Token即可
        return ApiResponse.success();
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/userinfo")
    @Operation(summary = "获取当前用户信息", description = "根据Token获取当前登录用户的详细信息")
    public ApiResponse<LoginResponse.UserInfo> getUserInfo(
            @Parameter(description = "JWT Token (Bearer xxx)", required = true) @RequestHeader("Authorization") String token) {
        // 移除 "Bearer " 前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        LoginResponse.UserInfo userInfo = authService.getUserInfo(token);
        return ApiResponse.success(userInfo);
    }
}
