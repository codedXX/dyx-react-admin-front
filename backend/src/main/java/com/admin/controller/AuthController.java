package com.admin.controller;

import com.admin.dto.ApiResponse;
import com.admin.dto.LoginRequest;
import com.admin.dto.LoginResponse;
import com.admin.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // 简化处理：前端清除Token即可
        return ApiResponse.success();
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/userinfo")
    public ApiResponse<LoginResponse.UserInfo> getUserInfo(@RequestHeader("Authorization") String token) {
        try {
            // 移除 "Bearer " 前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            LoginResponse.UserInfo userInfo = authService.getUserInfo(token);
            return ApiResponse.success(userInfo);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
