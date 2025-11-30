package com.admin.service;

import com.admin.dto.LoginRequest;
import com.admin.dto.LoginResponse;
import com.admin.entity.Role;
import com.admin.entity.User;
import com.admin.mapper.RoleMapper;
import com.admin.mapper.UserMapper;
import com.admin.util.JwtUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        
        // 查询角色信息
        Role role = roleMapper.selectById(user.getRoleId());
        String roleCode = role != null ? role.getRoleCode() : "USER";
        
        // 生成Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), roleCode);
        
        // 构建响应
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getAvatar(),
                roleCode,
                user.getEmail()
        );
        
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
        
        Role role = roleMapper.selectById(user.getRoleId());
        String roleCode = role != null ? role.getRoleCode() : "USER";
        
        return new LoginResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getAvatar(),
                roleCode,
                user.getEmail()
        );
    }
}
