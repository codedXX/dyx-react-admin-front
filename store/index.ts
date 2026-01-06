import { create } from "zustand";
import { User, TabItem, MenuItem } from "@/types";
import { menuApi } from "@/services/api";
import { devtools } from "zustand/middleware"; // <-- 1. 导入中间件

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  permissions: string[]; // 新增权限列表
  login: (user: User, token: string) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => void;
}

// 2. 注意这里的 create<AuthState>()(...) 语法（多了一对括号）
export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => {
      const token = localStorage.getItem("token");
      console.log('你')
      return {
        isAuthenticated: !!token,
        user: token ? JSON.parse(localStorage.getItem("user") || "null") : null,
        permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),

        login: (user, token) => {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          // 3. 第三个参数是 Action 的名称，会在 DevTools 记录里显示
          set(
            {
              isAuthenticated: true,
              user: user,
            },
            false,
            "auth/login"
          );
        },

        setPermissions: (permissions) => {
          localStorage.setItem("permissions", JSON.stringify(permissions));
          set({ permissions }, false, "auth/setPermissions");
        },

        logout: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("permissions");
          set(
            { isAuthenticated: false, user: null, permissions: [] },
            false,
            "auth/logout"
          );
        },
      };
    },
    // 4. 配置 DevTools 实例名称
    { name: "AuthStore" }
  )
);

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

export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set) => ({
      collapsed: false,
      toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
      tabs: [
        {
          key: "/dashboard",
          title: "仪表盘",
          path: "/dashboard",
          closable: false,
        },
      ],
      activeTabKey: "/dashboard",
      menus: [],
      addTab: (tab) =>
        set((state) => {
          if (state.tabs.find((t) => t.key === tab.key)) {
            return { activeTabKey: tab.key };
          }
          return { tabs: [...state.tabs, tab], activeTabKey: tab.key };
        }),
      removeTab: (key) =>
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.key !== key);
          let newActiveKey = state.activeTabKey;
          if (state.activeTabKey === key) {
            newActiveKey = newTabs[newTabs.length - 1]?.key || "/dashboard";
          }
          return { tabs: newTabs, activeTabKey: newActiveKey };
        }),
      setActiveTab: (key) => set({ activeTabKey: key }),
      fetchMenus: async () => {
        try {
          const response = await menuApi.getUserMenus();
          if (response.code === 200) {
            set({ menus: response.data });
          }
        } catch (error) {
          useAuthStore.getState().logout();
          console.error("获取菜单失败", error);
        }
      },
    }),
    { name: "LayoutStore" }
  )
);

interface ThemeState {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    (set) => ({
      primaryColor: localStorage.getItem("primaryColor") || "#4f46e5",

      setPrimaryColor: (color) => {
        localStorage.setItem("primaryColor", color);

        // 3. 第三个参数为 Action 名称
        set({ primaryColor: color }, false, "theme/setPrimaryColor");
      },
    }),
    // 4. 设置 DevTools 中的实例名称
    { name: "ThemeStore" }
  )
);
