package com.admin.interceptor;

import com.admin.annotation.RequiresPermission;
import com.admin.service.PermissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 权限校验拦截器
 * 检查用户是否拥有访问接口所需的权限
 */
@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Autowired
    private PermissionService permissionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 只处理Controller方法
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;

        // 检查方法是否有权限注解
        RequiresPermission annotation = handlerMethod.getMethodAnnotation(RequiresPermission.class);
        if (annotation == null) {
            // 没有权限注解,放行
            return true;
        }

        // 获取用户ID
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // 检查权限
        String requiredPermission = annotation.value();
        boolean hasPermission = permissionService.hasPermission(userId, requiredPermission);

        if (!hasPermission) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            try {
                response.getWriter().write("{\"code\":403,\"message\":\"权限不足\"}");
            } catch (Exception e) {
                e.printStackTrace();
            }
            return false;
        }

        return true;
    }
}
