package com.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录响应DTO
 */
@Data
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    
    private UserInfo userInfo;
    
    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String avatar;
        private String role;
        private String email;
    }
}
