package com.admin.service;

import com.admin.entity.Role;
import com.admin.mapper.RoleMapper;
import com.admin.entity.RoleMenu;
import com.admin.mapper.RoleMenuMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色服务
 */
@Service
public class RoleService extends ServiceImpl<RoleMapper, Role> {

    @Autowired
    private RoleMenuMapper roleMenuMapper;

    /**
     * 获取角色列表（分页+搜索）
     */
    public IPage<Role> getRoleList(Integer page, Integer size, String keyword) {
        Page<Role> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Role::getRoleName, keyword)
                    .or()
                    .like(Role::getRoleCode, keyword);
        }
        return this.page(pageParam, wrapper);
    }

    /**
     * 根据ID查询角色
     */
    public Role getRoleById(Long id) {
        return getById(id);
    }

    /**
     * 新增角色
     */
    public boolean addRole(Role role) {
        return save(role);
    }

    /**
     * 更新角色
     */
    public boolean updateRole(Role role) {
        return updateById(role);
    }

    /**
     * 删除角色
     */
    public boolean deleteRole(Long id) {
        // 删除角色时同时删除关联的菜单权限
        roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenu>()
                .eq(RoleMenu::getRoleId, id));
        return removeById(id);
    }

    /**
     * 获取角色拥有的菜单ID列表
     */
    public List<Long> getRoleMenus(Long roleId) {
        return roleMenuMapper.selectList(
                new LambdaQueryWrapper<RoleMenu>()
                        .eq(RoleMenu::getRoleId, roleId))
                .stream().map(RoleMenu::getMenuId).collect(Collectors.toList());
    }

    /**
     * 分配角色菜单权限
     */
    @Transactional
    public void assignRoleMenus(Long roleId, List<Long> menuIds) {
        // 先删除原有权限
        roleMenuMapper.delete(new LambdaQueryWrapper<RoleMenu>()
                .eq(RoleMenu::getRoleId, roleId));

        // 批量插入新权限
        if (menuIds != null && !menuIds.isEmpty()) {
            menuIds.forEach(menuId -> {
                roleMenuMapper.insert(new RoleMenu(roleId, menuId));
            });
        }
    }
}
