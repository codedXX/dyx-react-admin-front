export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  roles: string[]; // 修改为角色数组
  email: string;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  keepAlive?: number; // 0: 关闭, 1: 开启
  type?: 'menu' | 'button';
  permission?: string;
  parentId?: number;
  sortOrder?: number;
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
