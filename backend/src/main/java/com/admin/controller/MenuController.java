package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.Menu;
import com.admin.service.MenuService;
import com.admin.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 菜单控制器
 */
@RestController
@RequestMapping("/api/menus")
@Tag(name = "菜单管理", description = "菜单的增删改查及用户菜单获取接口")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 查询菜单树
     */
    @RequiresPermission("menu:list")
    @GetMapping
    @Operation(summary = "获取菜单树", description = "获取完整的菜单树结构")
    public ApiResponse<List<Menu>> getMenuTree() {
        List<Menu> menus = menuService.getMenuTree();
        return ApiResponse.success(menus);
    }

    /**
     * 获取当前用户的菜单树（基于角色权限）
     */
    @GetMapping("/user-menus")
    @Operation(summary = "获取用户菜单", description = "根据当前用户的角色权限获取可访问的菜单树")
    public ApiResponse<List<Menu>> getUserMenus(
            @Parameter(description = "JWT Token (Bearer xxx)", required = true) @RequestHeader("Authorization") String token) {
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
    @Operation(summary = "根据ID获取菜单", description = "根据菜单ID获取菜单详细信息")
    public ApiResponse<Menu> getMenuById(
            @Parameter(description = "菜单ID") @PathVariable Long id) {
        Menu menu = menuService.getMenuById(id);
        return ApiResponse.success(menu);
    }

    /**
     * 新增菜单
     */
    @RequiresPermission("menu:add")
    @PostMapping
    @Operation(summary = "新增菜单", description = "新增一个菜单或按钮")
    public ApiResponse<Void> addMenu(@RequestBody Menu menu) {
        boolean success = menuService.addMenu(menu);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }

    /**
     * 更新菜单
     */
    @RequiresPermission("menu:edit")
    @PutMapping("/{id}")
    @Operation(summary = "更新菜单", description = "根据ID更新菜单信息")
    public ApiResponse<Void> updateMenu(
            @Parameter(description = "菜单ID") @PathVariable Long id,
            @RequestBody Menu menu) {
        menu.setId(id);
        boolean success = menuService.updateMenu(menu);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }

    /**
     * 删除菜单
     */
    @RequiresPermission("menu:delete")
    @DeleteMapping("/{id}")
    @Operation(summary = "删除菜单", description = "根据ID删除菜单")
    public ApiResponse<Void> deleteMenu(
            @Parameter(description = "菜单ID") @PathVariable Long id) {
        boolean success = menuService.deleteMenu(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
