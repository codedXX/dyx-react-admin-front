package com.admin.service;

import com.admin.entity.Role;
import com.admin.entity.User;
import com.admin.entity.UserRole;
import com.admin.mapper.RoleMapper;
import com.admin.mapper.UserMapper;
import com.admin.mapper.UserRoleMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户服务
 */
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 获取用户列表
     */
    public IPage<User> getUserList(Integer page, Integer size, String keyword) {
        Page<User> pageParam = new Page<>(page, size);
        QueryWrapper<User> wrapper = new QueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like("username", keyword)
                    .or()
                    .like("email", keyword);
        }

        wrapper.orderByAsc("create_time");

        IPage<User> userPage = userMapper.selectPage(pageParam, wrapper);

        // 填充角色信息
        for (User user : userPage.getRecords()) {
            fillUserRoles(user);
        }

        return userPage;
    }

    /**
     * 根据ID获取用户
     */
    public User getUserById(Long id) {
        User user = userMapper.selectById(id);
        if (user != null) {
            fillUserRoles(user);
        }
        return user;
    }

    /**
     * 填充用户角色信息
     */
    private void fillUserRoles(User user) {
        QueryWrapper<UserRole> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", user.getId());
        List<UserRole> userRoles = userRoleMapper.selectList(wrapper);

        if (!userRoles.isEmpty()) {
            List<Long> roleIds = userRoles.stream()
                    .map(UserRole::getRoleId)
                    .collect(Collectors.toList());
            List<Role> roles = roleMapper.selectBatchIds(roleIds);
            user.setRoles(roles);
        }
    }

    /**
     * 新增用户
     */
    @Transactional
    public boolean addUser(User user) {
        // 检查用户名是否存在
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", user.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new RuntimeException("用户名已存在");
        }

        // 默认头像
        if (user.getAvatar() == null) {
            user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getUsername());
        }

        // 密码加密
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        int rows = userMapper.insert(user);

        // 保存角色关联
        if (rows > 0 && user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
            saveUserRoles(user.getId(), user.getRoleIds());
        }

        return rows > 0;
    }

    /**
     * 更新用户
     */
    @Transactional
    public boolean updateUser(User user) {
        // 密码加密
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        int rows = userMapper.updateById(user);

        // 更新角色关联
        if (rows > 0 && user.getRoleIds() != null) {
            // 先删除旧关联
            QueryWrapper<UserRole> wrapper = new QueryWrapper<>();
            wrapper.eq("user_id", user.getId());
            userRoleMapper.delete(wrapper);

            // 保存新关联
            if (!user.getRoleIds().isEmpty()) {
                saveUserRoles(user.getId(), user.getRoleIds());
            }
        }

        return rows > 0;
    }

    /**
     * 保存用户角色关联
     */
    private void saveUserRoles(Long userId, List<Long> roleIds) {
        for (Long roleId : roleIds) {
            UserRole userRole = new UserRole(userId, roleId);
            userRoleMapper.insert(userRole);
        }
    }

    /**
     * 删除用户
     */
    @Transactional
    public boolean deleteUser(Long id) {
        // 删除用户角色关联
        QueryWrapper<UserRole> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", id);
        userRoleMapper.delete(wrapper);

        return userMapper.deleteById(id) > 0;
    }
}
