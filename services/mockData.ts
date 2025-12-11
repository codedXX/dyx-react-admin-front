import { MenuItem, User, UserRole } from '@/types';

export const MENU_ITEMS: MenuItem[] = [
  { id: '1', title: '仪表盘', path: '/dashboard', icon: 'LayoutDashboard', keepAlive: true },
  { 
    id: '2', 
    title: '系统管理', 
    path: '/system', 
    icon: 'Settings',
    children: [
      { id: '2-1', title: '用户列表', path: '/system/user', keepAlive: true },
      { id: '2-2', title: '角色列表', path: '/system/role', keepAlive: true },
      { id: '2-3', title: '菜单列表', path: '/system/menu', keepAlive: false },
    ]
  },
  {
    id: '3',
    title: '文章管理',
    path: '/article',
    icon: 'FileText',
    children: [
      { id: '3-1', title: '编辑器', path: '/article/editor', keepAlive: true },
      { id: '3-2', title: '预览 (目录)', path: '/article/preview', keepAlive: true },
    ]
  },
  { id: '4', title: 'Excel 工具', path: '/excel', icon: 'Sheet', keepAlive: true },
  { id: '5', title: '即时通讯', path: '/chat', icon: 'MessageCircle', keepAlive: true },
];

export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', email: 'admin@test.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/1/200' },
  { id: '2', username: 'editor', email: 'editor@test.com', role: UserRole.USER, avatar: 'https://picsum.photos/seed/2/200' },
  { id: '3', username: 'guest', email: 'guest@test.com', role: UserRole.GUEST, avatar: 'https://picsum.photos/seed/3/200' },
];