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
  role: UserRole;
  email: string;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  keepAlive?: boolean;
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
