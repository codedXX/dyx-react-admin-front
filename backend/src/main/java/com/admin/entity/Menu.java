package com.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 菜单实体类
 */
@Data
@TableName("sys_menu")
@Schema(description = "菜单实体")
public class Menu {

    @TableId(type = IdType.AUTO)
    @Schema(description = "菜单ID")
    private Long id;

    @Schema(description = "菜单标题")
    private String title;

    @Schema(description = "路由路径")
    private String path;

    @Schema(description = "图标名称")
    private String icon;

    @Schema(description = "父级菜单ID")
    private Long parentId;

    @Schema(description = "是否缓存: 0-否, 1-是")
    private Integer keepAlive;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "类型: menu-菜单, button-按钮")
    private String type;

    @Schema(description = "权限标识,如 user:add")
    private String permission;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    private LocalDateTime updateTime;

    @TableField(exist = false)
    @Schema(description = "子菜单列表")
    private List<Menu> children;
}
