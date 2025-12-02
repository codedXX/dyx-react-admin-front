package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.User;
import com.admin.service.UserService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 获取所有用户（分页+搜索）
     */
    @RequiresPermission("user:list")
    @GetMapping
    public ApiResponse<IPage<User>> getAll(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.success(userService.getUserList(page, size, keyword));
    }

    /**
     * 根据ID获取用户
     */
    @RequiresPermission("user:list")
    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ApiResponse.success(user);
    }

    /**
     * 新增用户
     */
    @RequiresPermission("user:add")
    @PostMapping
    public ApiResponse<Void> addUser(@RequestBody User user) {
        boolean success = userService.addUser(user);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }

    /**
     * 更新用户
     */
    @RequiresPermission("user:edit")
    @PutMapping("/{id}")
    public ApiResponse<Void> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        boolean success = userService.updateUser(user);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }

    /**
     * 删除用户
     */
    @RequiresPermission("user:delete")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        boolean success = userService.deleteUser(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
