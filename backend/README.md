# React Admin Backend

React Admin Pro 后台管理系统的Java后端服务。

## 技术栈

- **Java**: 17
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0+
- **持久层**: MyBatis-Plus 3.5.5
- **认证**: JWT (io.jsonwebtoken)
- **WebSocket**: Spring WebSocket
- **Excel**: Apache POI 5.2.5

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库初始化

在MySQL中执行初始化脚本：

```bash
mysql -u root -p < src/main/resources/data.sql
```

或者手动导入 `src/main/resources/data.sql` 文件。

**默认数据库名**: `react_admin`

**默认用户账号**:
- 用户名: `admin`，密码: `123456`，角色: ADMIN
- 用户名: `editor`，密码: `123456`，角色: USER
- 用户名: `guest`，密码: `123456`，角色: GUEST

### 3. 配置文件

修改 `src/main/resources/application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/react_admin?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root  # 修改为你的密码
```

### 4. 运行项目

#### 方式1: 使用Maven

```bash
# 进入backend目录
cd backend

# 编译项目
mvn clean install

# 运行项目
mvn spring-boot:run
```

#### 方式2: 使用IDE

直接运行 `com.admin.AdminApplication` 主类。

### 5. 验证服务

服务启动后，访问：

- **后端API**: http://localhost:8080/api
- **WebSocket**: ws://localhost:8080/ws/chat

## API接口文档

### 认证相关

#### 登录
- **URL**: `POST /api/auth/login`
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "token": "xxx",
      "userInfo": {
        "id": 1,
        "username": "admin",
        "avatar": "https://...",
        "role": "ADMIN",
        "email": "admin@test.com"
      }
    }
  }
  ```

#### 获取用户信息
- **URL**: `GET /api/auth/userinfo`
- **请求头**: `Authorization: Bearer {token}`

#### 登出
- **URL**: `POST /api/auth/logout`

### 用户管理

- **查询所有用户**: `GET /api/users`
- **查询单个用户**: `GET /api/users/{id}`
- **新增用户**: `POST /api/users`
- **更新用户**: `PUT /api/users/{id}`
- **删除用户**: `DELETE /api/users/{id}`

### 角色管理

- **查询所有角色**: `GET /api/roles`
- **查询单个角色**: `GET /api/roles/{id}`
- **新增角色**: `POST /api/roles`
- **更新角色**: `PUT /api/roles/{id}`
- **删除角色**: `DELETE /api/roles/{id}`

### 菜单管理

- **查询菜单树**: `GET /api/menus`
- **查询单个菜单**: `GET /api/menus/{id}`
- **新增菜单**: `POST /api/menus`
- **更新菜单**: `PUT /api/menus/{id}`
- **删除菜单**: `DELETE /api/menus/{id}`

### 文章管理

- **查询文章列表**: `GET /api/articles?page=1&size=10`
- **查询单个文章**: `GET /api/articles/{id}`
- **保存文章**: `POST /api/articles`
- **删除文章**: `DELETE /api/articles/{id}`

### Excel功能

- **导入Excel**: `POST /api/excel/import` (multipart/form-data)
- **导出Excel**: `POST /api/excel/export`

### WebSocket聊天

- **连接端点**: `ws://localhost:8080/ws/chat`
- **发送消息**: 订阅 `/topic/messages`
- **接收消息**: 发送到 `/app/chat/send`

## 项目结构

```
backend/
├── src/main/java/com/admin/
│   ├── config/              # 配置类
│   ├── controller/          # 控制器
│   ├── service/             # 服务层
│   ├── mapper/              # MyBatis Mapper
│   ├── entity/              # 实体类
│   ├── dto/                 # 数据传输对象
│   ├── util/                # 工具类
│   └── AdminApplication.java # 主启动类
├── src/main/resources/
│   ├── application.yml      # 配置文件
│   └── data.sql             # 数据库初始化脚本
└── pom.xml                  # Maven配置
```

## 注意事项

1. **跨域配置**: 已在 `WebConfig` 中配置CORS，允许前端访问
2. **JWT密钥**: 配置在 `application.yml` 中，生产环境请修改
3. **密码加密**: 示例数据使用BCrypt加密，实际登录暂时简化处理
4. **端口配置**: 默认8080，可在配置文件中修改

## 常见问题

### 1. 数据库连接失败

检查MySQL服务是否启动，数据库是否已创建，用户名密码是否正确。

### 2. 依赖下载慢

配置Maven镜像源为阿里云：

```xml
<mirror>
  <id>aliyunmaven</id>
  <mirrorOf>*</mirrorOf>
  <name>阿里云公共仓库</name>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

### 3. WebSocket连接失败

确保前端使用正确的WebSocket地址，检查防火墙设置。

## 开发计划

- [ ] 添加接口权限验证
- [ ] 完善异常处理
- [ ] 添加日志记录
- [ ] 添加单元测试
- [ ] 添加接口文档（Swagger）
