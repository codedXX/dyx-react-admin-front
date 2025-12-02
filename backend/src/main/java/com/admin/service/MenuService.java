package com.admin.service;

import com.admin.entity.Menu;
import com.admin.entity.UserRole;
import com.admin.mapper.MenuMapper;
import com.admin.mapper.UserRoleMapper;
import com.admin.mapper.RoleMenuMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 菜单服务
 */
@Service
public class MenuService extends ServiceImpl<MenuMapper, Menu> {

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private RoleMenuMapper roleMenuMapper;

    /**
     * 查询菜单树
     */
    public List<Menu> getMenuTree() {
        // 查询所有菜单(只查询菜单类型,不包括按钮)
        QueryWrapper<Menu> wrapper = new QueryWrapper<>();
        // wrapper.eq("type", "menu"); // Allow all types including buttons
        wrapper.orderByAsc("sort_order");
        List<Menu> allMenus = list(wrapper);

        // 构建树形结构
        return buildMenuTree(allMenus);
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
        // 如果没有指定类型,默认为菜单
        if (menu.getType() == null || menu.getType().isEmpty()) {
            menu.setType("menu");
        }
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
     * 根据用户ID获取菜单树（基于多角色权限合并）
     */
    public List<Menu> getMenusByUserId(Long userId) {
        // 1. 获取用户的所有角色ID
        QueryWrapper<UserRole> userRoleWrapper = new QueryWrapper<>();
        userRoleWrapper.eq("user_id", userId);
        List<UserRole> userRoles = userRoleMapper.selectList(userRoleWrapper);

        if (userRoles.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        // 2. 获取所有角色的菜单ID列表(合并去重)
        QueryWrapper<com.admin.entity.RoleMenu> roleMenuWrapper = new QueryWrapper<>();
        roleMenuWrapper.in("role_id", roleIds);
        List<com.admin.entity.RoleMenu> roleMenus = roleMenuMapper.selectList(roleMenuWrapper);

        if (roleMenus.isEmpty()) {
            return new ArrayList<>();
        }

        // 去重菜单ID
        List<Long> menuIds = roleMenus.stream()
                .map(com.admin.entity.RoleMenu::getMenuId)
                .distinct()
                .collect(Collectors.toList());

        // 3. 查询菜单详情(只查询菜单类型,不包括按钮)
        QueryWrapper<Menu> menuWrapper = new QueryWrapper<>();
        menuWrapper.in("id", menuIds);
        menuWrapper.eq("type", "menu");
        menuWrapper.orderByAsc("sort_order");
        List<Menu> authorizedMenus = list(menuWrapper);

        // 4. 构建树形结构
        return buildMenuTree(authorizedMenus);
    }

    /**
     * 根据用户ID获取所有权限(包括菜单和按钮)
     */
    public List<String> getPermissionsByUserId(Long userId) {
        // 1. 获取用户的所有角色ID
        QueryWrapper<UserRole> userRoleWrapper = new QueryWrapper<>();
        userRoleWrapper.eq("user_id", userId);
        List<UserRole> userRoles = userRoleMapper.selectList(userRoleWrapper);

        if (userRoles.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        // 2. 获取所有角色的菜单ID列表
        QueryWrapper<com.admin.entity.RoleMenu> roleMenuWrapper = new QueryWrapper<>();
        roleMenuWrapper.in("role_id", roleIds);
        List<com.admin.entity.RoleMenu> roleMenus = roleMenuMapper.selectList(roleMenuWrapper);

        if (roleMenus.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> menuIds = roleMenus.stream()
                .map(com.admin.entity.RoleMenu::getMenuId)
                .distinct()
                .collect(Collectors.toList());

        // 3. 查询所有菜单和按钮,提取权限标识
        QueryWrapper<Menu> menuWrapper = new QueryWrapper<>();
        menuWrapper.in("id", menuIds);
        menuWrapper.isNotNull("permission");
        List<Menu> menus = list(menuWrapper);

        return menus.stream()
                .map(Menu::getPermission)
                .filter(p -> p != null && !p.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * 构建菜单树
     */
    private List<Menu> buildMenuTree(List<Menu> menus) {
        List<Menu> rootMenus = new ArrayList<>();
        for (Menu menu : menus) {
            if (menu.getParentId() == 0) {
                rootMenus.add(menu);
            }
            for (Menu child : menus) {
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
