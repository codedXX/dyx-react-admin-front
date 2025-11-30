import { create } from 'zustand';
import { User, UserRole, TabItem, MenuItem } from './types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  return {
    isAuthenticated: !!token,
    user: token ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    login: (username) => {
      const userObj = {
        id: '1',
        username,
        avatar: 'https://picsum.photos/200',
        role: username === 'admin' ? UserRole.ADMIN : UserRole.EDITOR, // Simple role logic for demo
        email: `${username}@example.com`
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      set({
        isAuthenticated: true,
        user: userObj
      });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isAuthenticated: false, user: null });
    }
  };
});

interface LayoutState {
  collapsed: boolean;
  toggleCollapse: () => void;
  tabs: TabItem[];
  activeTabKey: string;
  addTab: (tab: TabItem) => void;
  removeTab: (key: string) => void;
  setActiveTab: (key: string) => void;
  menus: MenuItem[];
  fetchMenus: () => Promise<void>;
}

import { menuApi } from './services/api';

export const useLayoutStore = create<LayoutState>((set) => ({
  collapsed: false,
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
  tabs: [{ key: '/dashboard', title: '仪表盘', path: '/dashboard', closable: false }],
  activeTabKey: '/dashboard',
  menus: [],
  addTab: (tab) => set((state) => {
    if (state.tabs.find(t => t.key === tab.key)) {
      return { activeTabKey: tab.key };
    }
    return { tabs: [...state.tabs, tab], activeTabKey: tab.key };
  }),
  removeTab: (key) => set((state) => {
    const newTabs = state.tabs.filter(t => t.key !== key);
    let newActiveKey = state.activeTabKey;
    if (state.activeTabKey === key) {
      newActiveKey = newTabs[newTabs.length - 1]?.key || '/dashboard';
    }
    return { tabs: newTabs, activeTabKey: newActiveKey };
  }),
  setActiveTab: (key) => set({ activeTabKey: key }),
  fetchMenus: async () => {
    try {
      const response: any = await menuApi.getUserMenus();
      if (response.code === 200) {
        set({ menus: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch menus', error);
    }
  }
}));

interface ThemeState {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  primaryColor: localStorage.getItem('primaryColor') || '#4f46e5', // Default Indigo-600
  setPrimaryColor: (color) => {
    localStorage.setItem('primaryColor', color);
    set({ primaryColor: color });
  }
}));