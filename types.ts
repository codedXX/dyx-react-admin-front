export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  EDITOR = "editor",
  GUEST = "GUEST",
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface Role {
  id: number;
  roleName: string;
  roleCode: string;
  description?: string;
  status?: number;
  createTime?: string;
}

export interface User {
  id: number;
  username: string;
  avatar?: string;
  roles?: Role[];
  email?: string;
  status?: number;
  createTime?: string;
  password?: string; // Optional for updates
}

export interface MenuItem {
  id: number;
  title: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  keepAlive?: number; // 0: 关闭, 1: 开启
  type?: "menu" | "button";
  permission?: string;
  parentId?: number;
  sortOrder?: number;
  component?: string;
  visible?: number;
}

export interface Article {
  id?: number;
  title: string;
  content: string;
  authorId?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
  views?: number;
}

export interface TabItem {
  key: string;
  title: string;
  path: string;
  closable: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}
