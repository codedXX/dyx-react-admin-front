package com.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 菜单实体类
 */
@Data
@TableName("sys_menu")
public class Menu {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String path;

    private String icon;

    private Long parentId;

    private Integer keepAlive;

    private Integer sortOrder;

    private String type; // menu-菜单, button-按钮

    private String permission; // 权限标识,如 user:add

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private java.util.List<Menu> children;
}
