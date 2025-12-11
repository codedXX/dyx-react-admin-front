package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.User;
import com.admin.service.UserService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户的增删改查接口")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 获取所有用户（分页+搜索）
     */
    @RequiresPermission("user:list")
    @GetMapping
    @Operation(summary = "获取用户列表", description = "分页查询用户列表，支持关键字搜索")
    public ApiResponse<IPage<User>> getAll(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String keyword) {
        return ApiResponse.success(userService.getUserList(page, size, keyword));
    }

    /**
     * 根据ID获取用户
     */
    @RequiresPermission("user:list")
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取用户", description = "根据用户ID获取用户详细信息")
    public ApiResponse<User> getUserById(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        User user = userService.getUserById(id);
        return ApiResponse.success(user);
    }

    /**
     * 新增用户
     */
    @RequiresPermission("user:add")
    @PostMapping
    @Operation(summary = "新增用户", description = "新增一个用户")
    public ApiResponse<Void> addUser(@RequestBody User user) {
        boolean success = userService.addUser(user);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }

    /**
     * 更新用户
     */
    @RequiresPermission("user:edit")
    @PutMapping("/{id}")
    @Operation(summary = "更新用户", description = "根据ID更新用户信息")
    public ApiResponse<Void> updateUser(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @RequestBody User user) {
        user.setId(id);
        boolean success = userService.updateUser(user);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }

    /**
     * 删除用户
     */
    @RequiresPermission("user:delete")
    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户", description = "根据ID删除用户")
    public ApiResponse<Void> deleteUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        boolean success = userService.deleteUser(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
