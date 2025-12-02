package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.Menu;
import com.admin.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 菜单控制器
 */
@RestController
@RequestMapping("/api/menus")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @Autowired
    private com.admin.util.JwtUtil jwtUtil;

    /**
     * 查询菜单树
     */
    @RequiresPermission("menu:list")
    @GetMapping
    public ApiResponse<List<Menu>> getMenuTree() {
        List<Menu> menus = menuService.getMenuTree();
        return ApiResponse.success(menus);
    }

    /**
     * 获取当前用户的菜单树（基于角色权限）
     */
    @GetMapping("/user-menus")
    public ApiResponse<List<Menu>> getUserMenus(@RequestHeader("Authorization") String token) {
        try {
            // 移除 "Bearer " 前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            // 从token获取用户ID
            Long userId = jwtUtil.getUserIdFromToken(token);
            List<Menu> menus = menuService.getMenusByUserId(userId);
            return ApiResponse.success(menus);
        } catch (Exception e) {
            return ApiResponse.error("获取菜单失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询菜单
     */
    @RequiresPermission("menu:list")
    @GetMapping("/{id}")
    public ApiResponse<Menu> getMenuById(@PathVariable Long id) {
        Menu menu = menuService.getMenuById(id);
        return ApiResponse.success(menu);
    }

    /**
     * 新增菜单
     */
    @RequiresPermission("menu:add")
    @PostMapping
    public ApiResponse<Void> addMenu(@RequestBody Menu menu) {
        boolean success = menuService.addMenu(menu);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }

    /**
     * 更新菜单
     */
    @RequiresPermission("menu:edit")
    @PutMapping("/{id}")
    public ApiResponse<Void> updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        menu.setId(id);
        boolean success = menuService.updateMenu(menu);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }

    /**
     * 删除菜单
     */
    @RequiresPermission("menu:delete")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        boolean success = menuService.deleteMenu(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
