package com.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录响应DTO
 */
@Data
@AllArgsConstructor
@Schema(description = "登录响应")
public class LoginResponse {

    @Schema(description = "JWT Token")
    private String token;

    @Schema(description = "用户信息")
    private UserInfo userInfo;

    @Data
    @AllArgsConstructor
    @Schema(description = "用户基本信息")
    public static class UserInfo {
        @Schema(description = "用户ID")
        private Long id;

        @Schema(description = "用户名")
        private String username;

        @Schema(description = "头像URL")
        private String avatar;

        @Schema(description = "角色名称")
        private String role;

        @Schema(description = "邮箱")
        private String email;
    }
}
