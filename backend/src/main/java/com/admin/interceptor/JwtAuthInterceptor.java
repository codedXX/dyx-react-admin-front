package com.admin.interceptor;

import com.admin.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT认证拦截器
 * 验证Token有效性,并将用户信息存入请求属性
 */
@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行OPTIONS请求
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // 白名单放行
        String requestURI = request.getRequestURI();
        System.out.println("[DEBUG] Request URI: " + requestURI);
        if (requestURI.contains("/auth/login") ||
                requestURI.contains("/auth/logout") ||
                requestURI.contains("/excel/export")) {
            System.out.println("[DEBUG] 白名单放行: " + requestURI);
            return true;
        }

        // 获取Token
        String token = request.getHeader("Authorization");
        System.out.println("[DEBUG] Authorization Header: " + token);
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        System.out.println("[DEBUG] Extracted Token: " + token);

        // 验证Token
        if (token == null || !jwtUtil.validateToken(token)) {
            System.out.println("[DEBUG] Token validation failed! Token is null: " + (token == null));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            try {
                response.getWriter().write("{\"code\":401,\"message\":\"未授权,请先登录\"}");
            } catch (Exception e) {
                e.printStackTrace();
            }
            return false;
        }

        // 将用户ID存入请求属性,供后续使用
        Long userId = jwtUtil.getUserIdFromToken(token);
        System.out.println("[DEBUG] User ID from token: " + userId);
        request.setAttribute("userId", userId);
        request.setAttribute("token", token);

        return true;
    }
}
