/*
 Navicat Premium Data Transfer

 Source Server         : 本地数据库
 Source Server Type    : MySQL
 Source Server Version : 80012
 Source Host           : localhost:3306
 Source Schema         : react_admin

 Target Server Type    : MySQL
 Target Server Version : 80012
 File Encoding         : 65001

 Date: 02/12/2025 23:54:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_article
-- ----------------------------
DROP TABLE IF EXISTS `sys_article`;
CREATE TABLE `sys_article`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '内容',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '作者',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '状态 1:发布 0:草稿',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文章表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_article
-- ----------------------------
INSERT INTO `sys_article` VALUES (1, 'React Admin 开发指南', '这是一个基于 React + Spring Boot 的后台管理系统...', 'admin', 1, '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_article` VALUES (2, 'RBAC 权限设计详解', 'RBAC (Role-Based Access Control) 是目前最流行的权限控制模型...', 'admin', 1, '2023-01-02 00:00:00', '2023-01-02 00:00:00');
INSERT INTO `sys_article` VALUES (3, 'Tailwind CSS 实战', 'Tailwind CSS 是一个功能类优先的 CSS 框架...', 'user', 1, '2023-01-03 00:00:00', '2023-01-03 00:00:00');

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_id` bigint(20) NULL DEFAULT 0 COMMENT '父菜单ID',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '菜单标题',
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '路由路径',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '图标',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序',
  `keep_alive` tinyint(4) NULL DEFAULT 1 COMMENT '是否缓存 1:是 0:否',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'menu' COMMENT '类型: menu-菜单, button-按钮',
  `permission` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '权限标识',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '菜单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
INSERT INTO `sys_menu` VALUES (1, 0, '仪表盘', '/dashboard', 'LayoutDashboard', 1, 1, 'menu', NULL, '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (2, 0, '系统管理', '/system', 'Settings', 2, 1, 'menu', NULL, '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (3, 2, '用户管理', '/system/user', 'User', 1, 1, 'menu', 'user:list', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (4, 2, '角色管理', '/system/role', 'Shield', 2, 1, 'menu', 'role:list', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (5, 2, '菜单管理', '/system/menu', 'Menu', 3, 1, 'menu', 'menu:list', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (6, 0, '文章管理', '/article', 'FileText', 3, 1, 'menu', 'article:list', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (7, 6, 'Excel处理', '/excel', 'FileSpreadsheet', 1, 1, 'menu', 'article:excel', '2023-01-01 00:00:00', '2025-12-02 23:50:31');
INSERT INTO `sys_menu` VALUES (11, 3, '新增用户', NULL, NULL, 1, 0, 'button', 'user:add', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (12, 3, '编辑用户', NULL, NULL, 2, 0, 'button', 'user:edit', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (13, 3, '删除用户', NULL, NULL, 3, 0, 'button', 'user:delete', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (14, 4, '新增角色', NULL, NULL, 1, 0, 'button', 'role:add', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (15, 4, '编辑角色', NULL, NULL, 2, 0, 'button', 'role:edit', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (16, 4, '删除角色', NULL, NULL, 3, 0, 'button', 'role:delete', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (17, 4, '分配权限', NULL, NULL, 4, 0, 'button', 'role:permission', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (18, 5, '新增菜单', NULL, NULL, 1, 0, 'button', 'menu:add', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (19, 5, '编辑菜单', NULL, NULL, 2, 0, 'button', 'menu:edit', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (20, 5, '删除菜单', NULL, NULL, 3, 0, 'button', 'menu:delete', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (21, 7, '新增文章', NULL, NULL, 1, 0, 'button', 'article:add', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (22, 7, '编辑文章', NULL, NULL, 2, 0, 'button', 'article:edit', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (23, 7, '删除文章', NULL, NULL, 3, 0, 'button', 'article:delete', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_menu` VALUES (100, 6, '聊天室', '/chat', 'MessageSquare', 2, 1, 'menu', 'article:chat', '2025-12-02 23:51:41', '2025-12-02 23:51:41');

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称',
  `role_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色编码',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '描述',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_code`(`role_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES (1, '超级管理员', 'ROLE_ADMIN', '拥有所有权限', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_role` VALUES (2, '普通用户', 'ROLE_USER', '仅拥有基本权限', '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_role` VALUES (3, '访客', 'ROLE_GUEST', '仅拥有查看权限', '2023-01-01 00:00:00', '2023-01-01 00:00:00');

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  `menu_id` bigint(20) NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_menu`(`role_id` ASC, `menu_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 139 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色菜单关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
INSERT INTO `sys_role_menu` VALUES (139, 1, 1);
INSERT INTO `sys_role_menu` VALUES (140, 1, 2);
INSERT INTO `sys_role_menu` VALUES (141, 1, 3);
INSERT INTO `sys_role_menu` VALUES (142, 1, 4);
INSERT INTO `sys_role_menu` VALUES (143, 1, 5);
INSERT INTO `sys_role_menu` VALUES (144, 1, 6);
INSERT INTO `sys_role_menu` VALUES (145, 1, 7);
INSERT INTO `sys_role_menu` VALUES (146, 1, 11);
INSERT INTO `sys_role_menu` VALUES (147, 1, 12);
INSERT INTO `sys_role_menu` VALUES (148, 1, 13);
INSERT INTO `sys_role_menu` VALUES (149, 1, 14);
INSERT INTO `sys_role_menu` VALUES (150, 1, 15);
INSERT INTO `sys_role_menu` VALUES (151, 1, 16);
INSERT INTO `sys_role_menu` VALUES (152, 1, 17);
INSERT INTO `sys_role_menu` VALUES (153, 1, 18);
INSERT INTO `sys_role_menu` VALUES (154, 1, 19);
INSERT INTO `sys_role_menu` VALUES (155, 1, 20);
INSERT INTO `sys_role_menu` VALUES (156, 1, 21);
INSERT INTO `sys_role_menu` VALUES (157, 1, 22);
INSERT INTO `sys_role_menu` VALUES (158, 1, 23);
INSERT INTO `sys_role_menu` VALUES (159, 1, 100);
INSERT INTO `sys_role_menu` VALUES (131, 2, 1);
INSERT INTO `sys_role_menu` VALUES (132, 2, 6);
INSERT INTO `sys_role_menu` VALUES (133, 2, 7);
INSERT INTO `sys_role_menu` VALUES (134, 2, 21);
INSERT INTO `sys_role_menu` VALUES (135, 2, 22);
INSERT INTO `sys_role_menu` VALUES (136, 3, 1);
INSERT INTO `sys_role_menu` VALUES (137, 3, 6);
INSERT INTO `sys_role_menu` VALUES (138, 3, 7);

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '状态 1:正常 0:禁用',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqA3Ry.vV4GENbPl.P.wT.X.X.X.X', 'admin@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 1, '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_user` VALUES (2, 'user', '$2a$10$7JB720yubVSZvUI0rEqK/.VqA3Ry.vV4GENbPl.P.wT.X.X.X.X', 'user@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', 1, '2023-01-01 00:00:00', '2023-01-01 00:00:00');
INSERT INTO `sys_user` VALUES (3, 'guest', '$2a$10$7JB720yubVSZvUI0rEqK/.VqA3Ry.vV4GENbPl.P.wT.X.X.X.X', 'guest@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest', 1, '2023-01-01 00:00:00', '2023-01-01 00:00:00');

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_role`(`user_id` ASC, `role_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
INSERT INTO `sys_user_role` VALUES (1, 1, 1);
INSERT INTO `sys_user_role` VALUES (2, 2, 2);
INSERT INTO `sys_user_role` VALUES (3, 3, 3);

SET FOREIGN_KEY_CHECKS = 1;
