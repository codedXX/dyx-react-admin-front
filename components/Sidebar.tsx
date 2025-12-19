import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store";
import { MENU_ITEMS } from "@/services/mockData";
import { MenuItem } from "@/types";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronRight, LayoutDashboard } from "lucide-react";

const SidebarItem: React.FC<{ item: MenuItem; collapsed: boolean }> = ({
  item,
  collapsed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const Icon = (Icons as any)[item.icon || "Circle"] || Icons.Circle;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname.startsWith(item.path);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-1">
      <NavLink
        to={item.path}
        onClick={handleClick}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
          ${
            isActive
              ? "bg-primary-50 text-primary-600 font-medium shadow-primary-100"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <Icon
          size={20}
          className={`${
            isActive && !hasChildren
              ? "text-primary-600"
              : "text-slate-400 group-hover:text-primary-600"
          }`}
        />

        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <span className="font-medium text-sm truncate">{item.title}</span>
            {hasChildren &&
              (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
          </div>
        )}
      </NavLink>

      {!collapsed && hasChildren && isOpen && (
        <div className="ml-4 pl-4 border-l border-slate-200 mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem key={child.id} item={child} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { collapsed, menus } = useLayoutStore();

  return (
    <aside
      className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-md">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              ReactAdmin
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {menus.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </div>

      {!collapsed && (
        <div className="p-4 text-xs text-center text-slate-400 border-t border-slate-50">
          v1.0.0
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
