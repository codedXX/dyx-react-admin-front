package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.Role;
import com.admin.service.RoleService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色控制器
 */
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    /**
     * 获取所有角色（分页+搜索）
     */
    @RequiresPermission("role:list")
    @GetMapping
    public ApiResponse<IPage<Role>> getAll(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.success(roleService.getRoleList(page, size, keyword));
    }

    /**
     * 根据ID获取角色
     */
    @RequiresPermission("role:list")
    @GetMapping("/{id}")
    public ApiResponse<Role> getRoleById(@PathVariable Long id) {
        Role role = roleService.getRoleById(id);
        return ApiResponse.success(role);
    }

    /**
     * 新增角色
     */
    @RequiresPermission("role:add")
    @PostMapping
    public ApiResponse<Void> addRole(@RequestBody Role role) {
        boolean success = roleService.addRole(role);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }

    /**
     * 更新角色
     */
    @RequiresPermission("role:edit")
    @PutMapping("/{id}")
    public ApiResponse<Void> updateRole(@PathVariable Long id, @RequestBody Role role) {
        role.setId(id);
        boolean success = roleService.updateRole(role);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }

    /**
     * 删除角色
     */
    @RequiresPermission("role:delete")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        boolean success = roleService.deleteRole(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }

    /**
     * 获取角色菜单权限
     */
    @RequiresPermission("role:permission")
    @GetMapping("/{id}/menus")
    public ApiResponse<List<Long>> getRoleMenus(@PathVariable Long id) {
        return ApiResponse.success(roleService.getRoleMenus(id));
    }

    /**
     * 分配角色菜单权限
     */
    @RequiresPermission("role:permission")
    @PostMapping("/{id}/menus")
    public ApiResponse<Void> assignRoleMenus(@PathVariable Long id, @RequestBody List<Long> menuIds) {
        roleService.assignRoleMenus(id, menuIds);
        return ApiResponse.success();
    }
}
