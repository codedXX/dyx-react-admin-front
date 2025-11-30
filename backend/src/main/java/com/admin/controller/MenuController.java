package com.admin.controller;

import com.admin.dto.ApiResponse;
import com.admin.entity.Menu;
import com.admin.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 菜单控制器
 */
@RestController
@RequestMapping("/api/menus")
public class MenuController {
    
    @Autowired
    private MenuService menuService;
    
    /**
     * 查询菜单树
     */
    @GetMapping
    public ApiResponse<List<Menu>> getMenuTree() {
        List<Menu> menus = menuService.getMenuTree();
        return ApiResponse.success(menus);
    }
    
    /**
     * 根据ID查询菜单
     */
    @GetMapping("/{id}")
    public ApiResponse<Menu> getMenuById(@PathVariable Long id) {
        Menu menu = menuService.getMenuById(id);
        return ApiResponse.success(menu);
    }
    
    /**
     * 新增菜单
     */
    @PostMapping
    public ApiResponse<Void> addMenu(@RequestBody Menu menu) {
        boolean success = menuService.addMenu(menu);
        return success ? ApiResponse.success() : ApiResponse.error("新增失败");
    }
    
    /**
     * 更新菜单
     */
    @PutMapping("/{id}")
    public ApiResponse<Void> updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        menu.setId(id);
        boolean success = menuService.updateMenu(menu);
        return success ? ApiResponse.success() : ApiResponse.error("更新失败");
    }
    
    /**
     * 删除菜单
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        boolean success = menuService.deleteMenu(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
