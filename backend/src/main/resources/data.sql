DROP TABLE IF EXISTS `chat_message`;
DROP TABLE IF EXISTS `article`;
DROP TABLE IF EXISTS `sys_role_menu`;
DROP TABLE IF EXISTS `sys_menu`;
DROP TABLE IF EXISTS `sys_user`;
DROP TABLE IF EXISTS `sys_role`;

-- 用户表
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `status` int DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色表
CREATE TABLE `sys_role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `role_code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 菜单表
CREATE TABLE `sys_menu` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT '0',
  `title` varchar(50) NOT NULL,
  `path` varchar(100) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `keep_alive` int DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色菜单关联表
CREATE TABLE `sys_role_menu` (
  `role_id` bigint NOT NULL,
  `menu_id` bigint NOT NULL,
  PRIMARY KEY (`role_id`, `menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章表
CREATE TABLE `article` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` longtext,
  `author_id` bigint DEFAULT NULL,
  `status` int DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 聊天记录表
CREATE TABLE `chat_message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(20) DEFAULT 'TEXT',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始数据
INSERT INTO `sys_role` (`id`, `role_name`, `role_code`, `description`) VALUES
(1, '超级管理员', 'ROLE_ADMIN', '拥有所有权限'),
(2, '普通用户', 'ROLE_USER', '仅拥有基本权限'),
(3, '访客', 'ROLE_GUEST', '仅拥有查看权限');

INSERT INTO `sys_user` (`id`, `username`, `password`, `email`, `role_id`, `avatar`) VALUES
(1, 'admin', '123456', 'admin@example.com', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
(2, 'editor', '123456', 'editor@example.com', 2, 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor'),
(3, 'guest', '123456', 'guest@example.com', 3, 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest');

INSERT INTO `sys_menu` (`id`, `parent_id`, `title`, `path`, `icon`, `sort_order`, `keep_alive`) VALUES
(1, 0, '仪表盘', '/dashboard', 'LayoutDashboard', 1, 1),
(2, 0, '系统管理', '/system', 'Settings', 2, 1),
(3, 2, '用户管理', '/system/user', 'Users', 1, 1),
(4, 2, '角色管理', '/system/role', 'Shield', 2, 1),
(5, 2, '菜单管理', '/system/menu', 'Menu', 3, 1),
(6, 0, '文章管理', '/article', 'FileText', 3, 1),
(7, 6, '写文章', '/article/editor', 'Edit', 1, 0),
(8, 6, '文章预览', '/article/preview', 'Eye', 2, 1),
(9, 0, '功能示例', '/feature', 'Box', 4, 1),
(10, 9, 'Excel处理', '/excel', 'FileSpreadsheet', 1, 1),
(11, 9, '聊天室', '/chat', 'MessageSquare', 2, 1);

-- 初始权限分配 (管理员拥有所有权限)
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) SELECT 1, id FROM `sys_menu`;
-- 普通用户权限
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES 
(2, 1), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11);
-- 访客权限
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES 
(3, 1), (3, 6), (3, 8);
