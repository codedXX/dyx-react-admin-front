package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.Role;
import com.admin.service.RoleService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色控制器
 */
@RestController
@RequestMapping("/api/roles")
@Tag(name = "角色管理", description = "角色的增删改查及权限分配接口")
public class RoleController {

    @Autowired
    private RoleService roleService;

    /**
     * 获取所有角色（分页+搜索）
     */
    @RequiresPermission("role:list")
    @GetMapping
    @Operation(summary = "获取角色列表", description = "分页查询角色列表，支持关键字搜索")
    public ApiResponse<IPage<Role>> getAll(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String keyword) {
        return ApiResponse.success(roleService.getRoleList(page, size, keyword));
    }

    /**
     * 根据ID获取角色
     */
    @RequiresPermission("role:list")
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取角色", description = "根据角色ID获取角色详细信息")
    public ApiResponse<Role> getRoleById(
            @Parameter(description = "角色ID") @PathVariable Long id) {
        Role role = roleService.getRoleById(id);
        return ApiResponse.success(role);
    }

    /**
     * 新增角色
     */
    @RequiresPermission("role:add")
    @PostMapping
    @Operation(summary = "新增角色", description = "新增一个角色")
    public ApiResponse<Void> addRole(@RequestBody Role role) {
        boolean success = roleService.addRole(role);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }

    /**
     * 更新角色
     */
    @RequiresPermission("role:edit")
    @PutMapping("/{id}")
    @Operation(summary = "更新角色", description = "根据ID更新角色信息")
    public ApiResponse<Void> updateRole(
            @Parameter(description = "角色ID") @PathVariable Long id,
            @RequestBody Role role) {
        role.setId(id);
        boolean success = roleService.updateRole(role);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }

    /**
     * 删除角色
     */
    @RequiresPermission("role:delete")
    @DeleteMapping("/{id}")
    @Operation(summary = "删除角色", description = "根据ID删除角色")
    public ApiResponse<Void> deleteRole(
            @Parameter(description = "角色ID") @PathVariable Long id) {
        boolean success = roleService.deleteRole(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }

    /**
     * 获取角色菜单权限
     */
    @RequiresPermission("role:permission")
    @GetMapping("/{id}/menus")
    @Operation(summary = "获取角色菜单权限", description = "获取指定角色已分配的菜单ID列表")
    public ApiResponse<List<Long>> getRoleMenus(
            @Parameter(description = "角色ID") @PathVariable Long id) {
        return ApiResponse.success(roleService.getRoleMenus(id));
    }

    /**
     * 分配角色菜单权限
     */
    @RequiresPermission("role:permission")
    @PostMapping("/{id}/menus")
    @Operation(summary = "分配角色菜单权限", description = "为指定角色分配菜单权限")
    public ApiResponse<Void> assignRoleMenus(
            @Parameter(description = "角色ID") @PathVariable Long id,
            @RequestBody List<Long> menuIds) {
        roleService.assignRoleMenus(id, menuIds);
        return ApiResponse.success();
    }
}
