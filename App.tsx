import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore, useLayoutStore, useThemeStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Bell, LogOut, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ThemeSettings from './components/ThemeSettings';
import { MENU_ITEMS } from './services/mockData';
import { loadComponent } from './utils/dynamicImport';

// ---- Components for Layout ----

const Header: React.FC = () => {
  const { toggleCollapse, collapsed } = useLayoutStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={toggleCollapse} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <Menu size={20} />
        </button>
        {/* <nav className="text-sm text-slate-500 hidden md:block">
          首页 / 仪表盘
        </nav> */}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        <ThemeSettings />

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.username}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="ml-2 text-slate-400 hover:text-rose-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

const Tabs: React.FC = () => {
  const { tabs, activeTabKey, setActiveTab, removeTab } = useLayoutStore();
  const navigate = useNavigate();

  const handleTabClick = (path: string) => {
    setActiveTab(path);
    navigate(path);
  };

  const handleClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    removeTab(key);
    // Navigation is handled in store logic or effect, but here we might need manual nudge if current tab closed
  };

  useEffect(() => {
    // Ensure route syncs if activeTab changes
    navigate(activeTabKey);
  }, [activeTabKey, navigate]);

  return (
    <div className="bg-white px-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto h-10 scrollbar-hide">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          onClick={() => handleTabClick(tab.key)}
          className={`
            flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-t-md cursor-pointer border-t-2 border-x border-b-0 transition-all select-none whitespace-nowrap
            ${activeTabKey === tab.key
              ? 'border-primary-500 bg-primary-50/50 text-primary-700 border-x-primary-100'
              : 'border-transparent text-slate-500 hover:text-slate-800'}
          `}
        >
          {tab.title}
          {tab.closable !== false && (
            <span
              onClick={(e) => handleClose(e, tab.key)}
              className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
            >
              <X size={12} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ---- KeepAlive Implementation ----

const PageContainer: React.FC<{ children: React.ReactNode, isVisible: boolean }> = ({ children, isVisible }) => {
  return (
    <div
      className="w-full h-full"
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      {/* Use simple fade animation when appearing, but don't unmount */}
      <motion.div
        initial={false} // Don't animate on first load if we want purely static, but let's add subtle enter
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Flatten routes to find keepAlive props
const flattenRoutes = (items: any[]): any[] => {
  return items.reduce((acc, item) => {
    if (item.children) return [...acc, ...flattenRoutes(item.children)];
    return [...acc, item];
  }, []);
};

const MainLayout: React.FC = () => {
  const { tabs, addTab, setActiveTab, fetchMenus, menus } = useLayoutStore();
  const location = useLocation();
  const allRoutes = flattenRoutes(menus.length > 0 ? menus : MENU_ITEMS);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Sync Router with Tabs
  useEffect(() => {
    const currentRoute = allRoutes.find(r => r.path === location.pathname);
    if (currentRoute) {
      addTab({
        key: currentRoute.path,
        title: currentRoute.title,
        path: currentRoute.path,
        closable: currentRoute.path !== '/dashboard'
      });
      setActiveTab(currentRoute.path);
    }
  }, [location.pathname, addTab, setActiveTab]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <Tabs />

        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden relative">
          {/* Custom KeepAlive Router Outlet */}
          {/* We render ALL tabs that are in the store, but hide the inactive ones. 
               This preserves their DOM and React State. */}
          {tabs.map(tab => {
            // 动态加载组件
            const Component = loadComponent(tab.key);
            const routeInfo = allRoutes.find(r => r.path === tab.key);

            // keepAlive 可能是 boolean (true/false) 或 number (0/1)
            // 需要正确处理这两种情况
            const shouldKeepAlive = routeInfo?.keepAlive === true || routeInfo?.keepAlive === 1;

            // 如果不需要缓存，且当前路由不是激活状态，则不渲染（完全卸载）
            if (!shouldKeepAlive && location.pathname !== tab.key) return null;

            return (
              <PageContainer key={tab.key} isVisible={location.pathname === tab.key}>
                <Component />
              </PageContainer>
            )
          })}
        </main>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  const { primaryColor } = useThemeStore();

  useEffect(() => {
    // Generate CSS variables for Tailwind
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);

    // Simple generation of shades (this is a simplified version)
    // In a real app, use a library like tinycolor2 or colord
    const hex2rgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const [r, g, b] = hex2rgb(primaryColor);

    // Define shades mapping (approximate)
    const shades = {
      50: 0.95,
      100: 0.9,
      200: 0.8,
      300: 0.7,
      400: 0.6,
      500: 0,   // Base
      600: -0.1,
      700: -0.2,
      800: -0.3,
      900: -0.4,
      950: -0.5,
    };

    Object.entries(shades).forEach(([shade, factor]) => {
      let newR, newG, newB;
      if (factor > 0) {
        // Mix with white (tint)
        newR = r + (255 - r) * factor;
        newG = g + (255 - g) * factor;
        newB = b + (255 - b) * factor;
      } else {
        // Mix with black (shade)
        const f = 1 + factor; // factor is negative
        newR = r * f;
        newG = g * f;
        newB = b * f;
      }
      root.style.setProperty(`--primary-${shade}`, `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`);
    });

  }, [primaryColor]);

  const LoginComponent = loadComponent('/login');

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/*" element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          } />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;