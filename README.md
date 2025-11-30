# React Admin Pro - 完整的前后端系统

一个基于React + Java的完整后台管理系统。前端使用React + TypeScript + Sass，后端使用Java 17 + Spring Boot + MySQL + MyBatis-Plus。

## 项目结构

```
react-admin-pro (1)/
├── pages/                  # 前端页面
├── components/             # 前端组件
├── services/               # API服务封装
├── backend/                # Java后端项目
│   ├── src/main/java/      # Java源代码
│   ├── src/main/resources/ # 配置文件和SQL脚本
│   └── pom.xml             # Maven配置
└── README.md               # 本文件
```

## 快速开始

### 前提条件

- Node.js 16+
- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 1. 数据库初始化

在MySQL中执行以下命令：

```bash
mysql -u root -p < backend/src/main/resources/data.sql
```

这将创建数据库`react_admin`及其所有表和默认数据。

**默认用户账号：**
- 管理员: `admin` / `123456`
- 编辑者: `editor` / `123456`
- 访客: `guest` / `123456`

### 2. 启动后端服务

```bash
# 进入backend目录
cd backend

# 安装依赖并编译
mvn clean install

# 启动Spring Boot应用
mvn spring-boot:run
```

后端将在 `http://localhost:8080` 启动。

### 3. 启动前端服务

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` (或其他端口) 启动。

## 功能特性

### 1. 用户认证
- JWT Token认证
- 登录/登出
- 用户信息管理

### 2. 系统管理
- **用户管理**: 查看、新增、编辑、删除用户
- **角色管理**: 管理用户角色
- **菜单管理**: 管理系统菜单结构

### 3. 文章管理
- Markdown编辑器，支持实时预览
- 文章保存和查询
- 动态目录生成和导航
- 目录高亮显示当前阅读位置

### 4. Excel功能
- Excel文件导入（解析并显示数据）
- 数据导出为Excel文件

###  5. 即时通讯
- 基于WebSocket的实时聊天
- 消息历史记录

### 6. 其他特性
- Keep-Alive组件缓存
- 页面过渡动画
- 现代化的UI设计
- 响应式布局

## API文档

### 基础配置

- **Base URL**: `http://localhost:8080/api`
- **认证方式**: Bearer Token (在请求头中添加 `Authorization: Bearer {token}`)

### 认证接口

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "xxx",
    "userInfo": {...}
  }
}
```

#### 获取当前用户信息
```
GET /api/auth/userinfo
Authorization: Bearer {token}
```

### 用户管理接口

- `GET /api/users` - 查询所有用户
- `GET /api/users/{id}` - 查询单个用户
- `POST /api/users` - 新增用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 角色管理接口

- `GET /api/roles` - 查询所有角色
- `POST /api/roles` - 新增角色
- `PUT /api/roles/{id}` - 更新角色
- `DELETE /api/roles/{id}` - 删除角色

### 菜单管理接口

- `GET /api/menus` - 查询菜单树
- `POST /api/menus` - 新增菜单
- `PUT /api/menus/{id}` - 更新菜单
- `DELETE /api/menus/{id}` - 删除菜单

### 文章管理接口

- `GET /api/articles?page=0&size=10` - 查询文章列表
- `GET /api/articles/{id}` - 查询单个文章
- `POST /api/articles` - 保存文章
- `DELETE /api/articles/{id}` - 删除文章

### Excel接口

- `POST /api/excel/import` - 导入Excel (multipart/form-data)
- `POST /api/excel/export` - 导出Excel

### WebSocket

- **连接地址**: `ws://localhost:8080/ws/chat`
- **消息格式**: STOMP协议

## 技术栈

### 前端
- React 19
- TypeScript
- React Router DOM
- Zustand (状态管理)
- Axios (HTTP客户端)
- Framer Motion (动画)
- React Markdown (Markdown渲染)
- XLSX (Excel处理)
- Lucide React (图标)

### 后端
- Java 17
- Spring Boot 3.2.0
- MySQL 8.0+
- MyBatis-Plus 3.5.5
- JWT (认证)
- Apache POI (Excel处理)
- Spring WebSocket (实时通讯)

## 开发说明

### 后端配置文件

后端配置文件位于 `backend/src/main/resources/application.yml`，可修改：

- 数据库连接信息
- 服务器端口
- JWT密钥和过期时间

### 前端API配置

前端API配置位于 `services/api.ts`，可修改：

- API基础URL
- 请求超时时间
- 拦截器逻辑

### 跨域配置

后端已配置CORS，允许所有来源访问。生产环境建议限制允许的域名。

## 常见问题

### 1. 前端无法连接后端

- 检查后端是否在8080端口运行
- 检查浏览器控制台的网络请求
- 确认后端CORS配置正确

### 2. 数据库连接失败

- 检查MySQL服务是否启动
- 确认数据库用户名和密码正确
- 查看后端日志输出

### 3. TypeScript编译错误

- 运行 `npm install` 确保所有依赖已安装
- 删除 `node_modules` 后重新安装

### 4. WebSocket连接失败

- 确认后端WebSocket配置正确
- 检查浏览器是否支持WebSocket
- 查看浏览器控制台错误信息

## 部署

### 后端部署

```bash
# 打包
cd backend
mvn clean package

# 运行JAR文件
java -jar target/react-admin-backend-1.0.0.jar
```

### 前端部署

```bash
# 构建生产版本
npm run build

# 部署dist目录到Web服务器
```

## License

MIT

## 贡献

欢迎提交Issue和Pull Request！
