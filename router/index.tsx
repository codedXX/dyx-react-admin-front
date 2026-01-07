import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";
import { loadComponent } from "@/utils/dynamicImport";
import MainLayout from "@/views/Layout/index";

// ---- 路由保护组件 ----

export const PrivateRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  console.log('路由的isAuthenticated',isAuthenticated)
  //组件返回<Outlet />，意味着“允许通过”
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// ---- 路由配置 ----

const LoginComponent = loadComponent("/login");

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginComponent />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "*",
        element: <MainLayout />,
      },
    ],
  },
]);
