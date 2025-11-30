package com.admin.service;

import com.admin.entity.User;
import com.admin.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 用户服务
 */
@Service
public class UserService extends ServiceImpl<UserMapper, User> {
    
    /**
     * 查询所有用户
     */
    public List<User> getAllUsers() {
        return list();
    }
    
    /**
     * 根据ID查询用户
     */
    public User getUserById(Long id) {
        return getById(id);
    }
    
    /**
     * 新增用户
     */
    public boolean addUser(User user) {
        return save(user);
    }
    
    /**
     * 更新用户
     */
    public boolean updateUser(User user) {
        return updateById(user);
    }
    
    /**
     * 删除用户
     */
    public boolean deleteUser(Long id) {
        return removeById(id);
    }
    
    /**
     * 获取用户列表（分页+搜索）
     */
    public IPage<User> getUserList(Integer page, Integer size, String keyword) {
        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(User::getUsername, keyword)
                   .or()
                   .like(User::getEmail, keyword);
        }
        return this.page(pageParam, wrapper);
    }

    /**
     * 根据用户名查询
     */
    public User getByUsername(String username) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        return getOne(wrapper);
    }
}
