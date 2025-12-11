import axios from 'axios';

// 创建axios实例
const api = axios.create({
  // baseURL: 'http://localhost:8080/api',
    baseURL: 'http://8.138.240.173:8080/api',
  timeout: 10000,
});

// 请求拦截器 - 添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，跳转登录
      localStorage.removeItem('token');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// ============= 认证相关 =============

export const authApi = {
  // 登录
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),

  // 登出
  logout: () =>
    api.post('/auth/logout'),

  // 获取当前用户信息
  getUserInfo: () =>
    api.get('/auth/userinfo'),
};

// ============= 用户管理 =============

export const userApi = {
  // 获取所有用户 (分页+搜索)
  getAll: (page = 1, size = 10, keyword = '') =>
    api.get(`/users?page=${page}&size=${size}&keyword=${keyword}`),

  // 根据ID获取用户
  getById: (id: number) =>
    api.get(`/users/${id}`),

  // 新增用户
  create: (data: any) =>
    api.post('/users', data),

  // 更新用户
  update: (id: number, data: any) =>
    api.put(`/users/${id}`, data),

  // 删除用户
  delete: (id: number) =>
    api.delete(`/users/${id}`),
};

// ============= 角色管理 =============

export const roleApi = {
  // 获取所有角色 (分页+搜索)
  getAll: (page = 1, size = 10, keyword = '') =>
    api.get(`/roles?page=${page}&size=${size}&keyword=${keyword}`),

  // 根据ID获取角色
  getById: (id: number) =>
    api.get(`/roles/${id}`),

  // 新增角色
  create: (data: any) =>
    api.post('/roles', data),

  // 更新角色
  update: (id: number, data: any) =>
    api.put(`/roles/${id}`, data),

  // 删除角色
  delete: (id: number) =>
    api.delete(`/roles/${id}`),

  // 获取角色菜单权限
  getMenus: (id: number) =>
    api.get(`/roles/${id}/menus`),

  // 分配角色菜单权限
  assignMenus: (id: number, menuIds: number[]) =>
    api.post(`/roles/${id}/menus`, menuIds),
};

// ============= 菜单管理 =============

export const menuApi = {
  // 获取菜单树
  getTree: () =>
    api.get('/menus'),

  // 根据ID获取菜单
  getById: (id: number) =>
    api.get(`/menus/${id}`),

  // 新增菜单
  create: (data: any) =>
    api.post('/menus', data),

  // 更新菜单
  update: (id: number, data: any) =>
    api.put(`/menus/${id}`, data),

  // 删除菜单
  delete: (id: number) =>
    api.delete(`/menus/${id}`),

  // 获取当前用户的菜单（基于角色权限）
  getUserMenus: () =>
    api.get('/menus/user-menus'),
};

// ============= 文章管理 =============

export const articleApi = {
  // 获取文章列表
  getList: (page = 0, size = 10) =>
    api.get(`/articles?page=${page}&size=${size}`),

  // 根据ID获取文章
  getById: (id: number) =>
    api.get(`/articles/${id}`),

  // 保存文章
  save: (data: any) =>
    api.post('/articles', data),

  // 删除文章
  delete: (id: number) =>
    api.delete(`/articles/${id}`),
};

// ============= Excel功能 =============

export const excelApi = {
  // 导入Excel
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/excel/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 导出Excel
  export: async (data: { headers: string[]; data: any[] }) => {
    const response = await axios.post('http://localhost:8080/api/excel/export', data, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '导出数据.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default api;
