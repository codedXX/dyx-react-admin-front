import { useAuthStore } from '@/store';

/**
 * 权限控制 Hook
 * 用于检查当前用户是否拥有指定权限
 */
export const usePermission = () => {
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  /**
   * 检查是否有权限
   * @param permission 权限标识，如 'user:add'
   * @returns boolean
   */
  const hasPermission = (permission: string): boolean => {
    // 超级管理员拥有所有权限
    if (user?.roles?.includes('ROLE_ADMIN')) {
      return true;
    }
    
    if (!permission) {
      return true;
    }
    
    return permissions.includes(permission);
  };

  /**
   * 检查是否拥有任一权限
   * @param perms 权限数组
   * @returns boolean
   */
  const hasAnyPermission = (perms: string[]): boolean => {
    if (user?.roles?.includes('ROLE_ADMIN')) {
      return true;
    }
    
    if (!perms || perms.length === 0) {
      return true;
    }
    
    return perms.some(p => permissions.includes(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    permissions
  };
};
