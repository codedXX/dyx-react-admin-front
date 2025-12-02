package com.admin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 权限服务
 * 提供权限判断功能
 */
@Service
public class PermissionService {

    @Autowired
    private MenuService menuService;

    /**
     * 判断用户是否拥有指定权限
     * 
     * @param userId     用户ID
     * @param permission 权限标识,如 "user:add"
     * @return 是否拥有权限
     */
    public boolean hasPermission(Long userId, String permission) {
        if (userId == null || permission == null || permission.isEmpty()) {
            return false;
        }

        // 获取用户的所有权限
        List<String> userPermissions = menuService.getPermissionsByUserId(userId);

        // 检查是否包含所需权限
        return userPermissions.contains(permission);
    }

    /**
     * 判断用户是否拥有任一权限
     * 
     * @param userId      用户ID
     * @param permissions 权限列表
     * @return 是否拥有任一权限
     */
    public boolean hasAnyPermission(Long userId, String... permissions) {
        if (userId == null || permissions == null || permissions.length == 0) {
            return false;
        }

        List<String> userPermissions = menuService.getPermissionsByUserId(userId);

        for (String permission : permissions) {
            if (userPermissions.contains(permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 判断用户是否拥有所有权限
     * 
     * @param userId      用户ID
     * @param permissions 权限列表
     * @return 是否拥有所有权限
     */
    public boolean hasAllPermissions(Long userId, String... permissions) {
        if (userId == null || permissions == null || permissions.length == 0) {
            return false;
        }

        List<String> userPermissions = menuService.getPermissionsByUserId(userId);

        for (String permission : permissions) {
            if (!userPermissions.contains(permission)) {
                return false;
            }
        }

        return true;
    }
}
