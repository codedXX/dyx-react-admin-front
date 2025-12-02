-- ==========================================
-- 数据迁移脚本: 单角色 -> 多角色 + 按钮权限
-- 执行前请备份数据库!
-- ==========================================

USE react_admin;

-- 1. 创建临时表保存现有用户角色关系
CREATE TABLE IF NOT EXISTS temp_user_roles AS
SELECT id as user_id, role_id FROM sys_user WHERE role_id IS NOT NULL;

-- 2. 创建用户角色关联表
CREATE TABLE IF NOT EXISTS `sys_user_role` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 3. 迁移数据到新的关联表
INSERT INTO sys_user_role (user_id, role_id)
SELECT user_id, role_id FROM temp_user_roles;

-- 4. 删除临时表
DROP TABLE temp_user_roles;

-- 5. 修改菜单表,添加类型和权限字段
ALTER TABLE sys_menu 
ADD COLUMN IF NOT EXISTS `type` VARCHAR(20) DEFAULT 'menu' COMMENT '类型: menu-菜单, button-按钮' AFTER `sort_order`,
ADD COLUMN IF NOT EXISTS `permission` VARCHAR(100) DEFAULT NULL COMMENT '权限标识' AFTER `type`;

-- 6. 更新现有菜单的类型为 menu
UPDATE sys_menu SET type = 'menu' WHERE type IS NULL;

-- 7. 添加按钮权限示例数据

-- 用户管理的按钮权限
INSERT INTO sys_menu (parent_id, title, path, icon, sort_order, keep_alive, type, permission) VALUES
(3, '新增用户', NULL, NULL, 1, 0, 'button', 'user:add'),
(3, '编辑用户', NULL, NULL, 2, 0, 'button', 'user:edit'),
(3, '删除用户', NULL, NULL, 3, 0, 'button', 'user:delete'),
(3, '分配角色', NULL, NULL, 4, 0, 'button', 'user:role');

-- 角色管理的按钮权限
INSERT INTO sys_menu (parent_id, title, path, icon, sort_order, keep_alive, type, permission) VALUES
(4, '新增角色', NULL, NULL, 1, 0, 'button', 'role:add'),
(4, '编辑角色', NULL, NULL, 2, 0, 'button', 'role:edit'),
(4, '删除角色', NULL, NULL, 3, 0, 'button', 'role:delete'),
(4, '分配权限', NULL, NULL, 4, 0, 'button', 'role:permission');

-- 菜单管理的按钮权限
INSERT INTO sys_menu (parent_id, title, path, icon, sort_order, keep_alive, type, permission) VALUES
(5, '新增菜单', NULL, NULL, 1, 0, 'button', 'menu:add'),
(5, '编辑菜单', NULL, NULL, 2, 0, 'button', 'menu:edit'),
(5, '删除菜单', NULL, NULL, 3, 0, 'button', 'menu:delete');

-- 文章管理的按钮权限
INSERT INTO sys_menu (parent_id, title, path, icon, sort_order, keep_alive, type, permission) VALUES
(6, '新增文章', NULL, NULL, 1, 0, 'button', 'article:add'),
(6, '编辑文章', NULL, NULL, 2, 0, 'button', 'article:edit'),
(6, '删除文章', NULL, NULL, 3, 0, 'button', 'article:delete');

-- 8. 为管理员角色分配所有按钮权限
INSERT INTO sys_role_menu (role_id, menu_id) 
SELECT 1, id FROM sys_menu WHERE type = 'button';

-- 9. 为普通用户分配部分按钮权限(文章相关)
INSERT INTO sys_role_menu (role_id, menu_id) 
SELECT 2, id FROM sys_menu WHERE type = 'button' AND permission LIKE 'article:%';

-- 10. 删除 sys_user 表的 role_id 字段(可选,建议保留一段时间作为备份)
-- ALTER TABLE sys_user DROP COLUMN role_id;

-- 迁移完成提示
SELECT '数据迁移完成!' as message,
       (SELECT COUNT(*) FROM sys_user_role) as user_role_count,
       (SELECT COUNT(*) FROM sys_menu WHERE type = 'button') as button_permission_count;
