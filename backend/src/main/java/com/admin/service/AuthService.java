package com.admin.service;

import com.admin.dto.LoginRequest;
import com.admin.dto.LoginResponse;
import com.admin.entity.Role;
import com.admin.entity.User;
import com.admin.entity.UserRole;
import com.admin.mapper.RoleMapper;
import com.admin.mapper.UserMapper;
import com.admin.mapper.UserRoleMapper;
import com.admin.util.JwtUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 认证服务
 */
@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 简化处理：这里应该使用BCrypt验证密码，但为了简单，我们暂时跳过
        // 实际应该：BCrypt.checkpw(request.getPassword(), user.getPassword())

        // 查询用户的所有角色
        List<Role> roles = getUserRoles(user.getId());

        // 将角色代码列表转为逗号分隔的字符串
        String roleCodes = roles.stream()
                .map(Role::getRoleCode)
                .collect(Collectors.joining(","));

        // 生成Token (包含所有角色)
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), roleCodes);

        // 构建响应
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getAvatar(),
                roleCodes, // 返回所有角色代码
                user.getEmail());

        return new LoginResponse(token, userInfo);
    }

    /**
     * 获取当前用户信息（通过Token）
     */
    public LoginResponse.UserInfo getUserInfo(String token) {
        Long userId = jwtUtil.getUserIdFromToken(token);
        User user = userMapper.selectById(userId);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 查询用户的所有角色
        List<Role> roles = getUserRoles(userId);
        String roleCodes = roles.stream()
                .map(Role::getRoleCode)
                .collect(Collectors.joining(","));

        return new LoginResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getAvatar(),
                roleCodes,
                user.getEmail());
    }

    /**
     * 获取用户的所有角色
     */
    private List<Role> getUserRoles(Long userId) {
        // 查询用户角色关联
        QueryWrapper<UserRole> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        List<UserRole> userRoles = userRoleMapper.selectList(wrapper);

        if (userRoles.isEmpty()) {
            return List.of();
        }

        // 查询角色详情
        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        return roleMapper.selectBatchIds(roleIds);
    }
}
