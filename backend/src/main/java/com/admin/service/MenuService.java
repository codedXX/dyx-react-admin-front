package com.admin.service;

import com.admin.entity.Menu;
import com.admin.mapper.MenuMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 菜单服务
 */
@Service
public class MenuService extends ServiceImpl<MenuMapper, Menu> {
    
    @org.springframework.beans.factory.annotation.Autowired
    private com.admin.mapper.UserMapper userMapper;
    
    @org.springframework.beans.factory.annotation.Autowired
    private com.admin.mapper.RoleMenuMapper roleMenuMapper;
    
    /**
     * 查询菜单树
     */
    public List<Menu> getMenuTree() {
        // 查询所有菜单
        QueryWrapper<Menu> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("sort_order");
        List<Menu> allMenus = list(wrapper);
        
        // 构建树形结构
        List<Menu> rootMenus = new ArrayList<>();
        for (Menu menu : allMenus) {
            if (menu.getParentId() == 0) {
                rootMenus.add(menu);
            }
            for (Menu child : allMenus) {
                if (child.getParentId().equals(menu.getId())) {
                    if (menu.getChildren() == null) {
                        menu.setChildren(new ArrayList<>());
                    }
                    menu.getChildren().add(child);
                }
            }
        }
        return rootMenus;
    }
    
    /**
     * 根据ID查询菜单
     */
    public Menu getMenuById(Long id) {
        return getById(id);
    }
    
    /**
     * 新增菜单
     */
    public boolean addMenu(Menu menu) {
        return save(menu);
    }
    
    /**
     * 更新菜单
     */
    public boolean updateMenu(Menu menu) {
        return updateById(menu);
    }
    
    /**
     * 删除菜单
     */
    public boolean deleteMenu(Long id) {
        return removeById(id);
    }
    
    /**
     * 根据用户ID获取菜单树（基于角色权限）
     */
    public List<Menu> getMenusByUserId(Long userId) {
        // 1. 获取用户信息
        com.admin.entity.User user = userMapper.selectById(userId);
        if (user == null) {
            return new ArrayList<>();
        }
        
        // 2. 获取用户角色的菜单ID列表
        List<com.admin.entity.RoleMenu> roleMenus = roleMenuMapper.selectList(
            new QueryWrapper<com.admin.entity.RoleMenu>()
                .eq("role_id", user.getRoleId())
        );
        
        if (roleMenus.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Long> menuIds = roleMenus.stream()
            .map(com.admin.entity.RoleMenu::getMenuId)
            .collect(Collectors.toList());
        
        // 3. 查询菜单（只查询有权限的菜单）
        QueryWrapper<Menu> wrapper = new QueryWrapper<>();
        wrapper.in("id", menuIds);
        wrapper.orderByAsc("sort_order");
        List<Menu> authorizedMenus = list(wrapper);
        
        // 4. 构建树形结构
        List<Menu> rootMenus = new ArrayList<>();
        for (Menu menu : authorizedMenus) {
            if (menu.getParentId() == 0) {
                rootMenus.add(menu);
            }
            for (Menu child : authorizedMenus) {
                if (child.getParentId().equals(menu.getId())) {
                    if (menu.getChildren() == null) {
                        menu.setChildren(new ArrayList<>());
                    }
                    menu.getChildren().add(child);
                }
            }
        }
        return rootMenus;
    }
}
