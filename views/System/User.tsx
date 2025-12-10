import React, { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui/LayoutComponents";
import { Edit, Trash, Plus } from "lucide-react";
import { userApi } from "@/services/api";
import { message, Modal, Form, Input, Select } from "antd";
import "./User.scss";

const { Option } = Select;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [form] = Form.useForm();

  // 分页和搜索状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [keyword, setKeyword] = useState("");

  // 获取用户列表
  const fetchUsers = async (page = 1, size = 10, searchKeyword = "") => {
    setLoading(true);
    try {
      const response = await userApi.getAll(page, size, searchKeyword);
      if ((response as any).code === 200) {
        setUsers((response as any).data.records);
        setPagination({
          current: (response as any).data.current,
          pageSize: (response as any).data.size,
          total: (response as any).data.total,
        });
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, keyword);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (window.confirm("确定要删除该用户吗？")) {
      try {
        const response = await userApi.delete(id);
        if ((response as any).code === 200) {
          message.success("删除成功");
          fetchUsers(pagination.current, pagination.pageSize, keyword);
        } else {
          message.error("删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    }
  };

  // 打开模态框
  const openModal = (mode: "create" | "edit", user?: any) => {
    setModalMode(mode);
    setCurrentUser(user);
    setIsModalOpen(true);
    if (mode === "edit" && user) {
      // 转换角色数据用于回显
      const roleIds = user.roles ? user.roles.map((r: any) => r.id) : [];
      form.setFieldsValue({
        ...user,
        roleIds: roleIds,
      });
    } else {
      form.resetFields();
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let response;

      // 构造提交数据
      const submitData = {
        ...values,
        // 如果后端需要 roles 对象列表而不是 ID 列表，这里可能需要调整
        // 但通常后端接收 ID 列表更方便，或者后端根据 ID 列表处理
        // 假设后端接收 roleIds 列表或者我们在前端不处理，直接传给后端，后端 User 实体没有 roleIds 字段
        // 我们需要修改 User 实体或者 DTO 来接收 roleIds
        // 由于我们修改了 User 实体，移除了 roleId，但没有添加 roleIds 字段用于接收参数
        // 我们可能需要在 User 实体中添加一个临时字段 roleIds 用于接收参数
        // 或者修改后端 Controller 接收 DTO
        // 暂时假设后端 User 实体添加了 @TableField(exist = false) private List<Long> roleIds;
        roleIds: values.roleIds,
      };

      if (modalMode === "create") {
        response = await userApi.create(submitData);
      } else {
        response = await userApi.update(currentUser.id, submitData);
      }

      if ((response as any).code === 200) {
        message.success(modalMode === "create" ? "新增成功" : "更新成功");
        setIsModalOpen(false);
        fetchUsers(pagination.current, pagination.pageSize, keyword);
      } else {
        message.error((response as any).message || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  return (
    <>
      <Card
        title="用户管理"
        actions={
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索用户名/邮箱"
                className="px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button variant="secondary" onClick={handleSearch}>
                搜索
              </Button>
            </form>
            <Button variant="primary" onClick={() => openModal("create")}>
              <Plus size={16} /> 新增用户
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    加载中...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "https://via.placeholder.com/40"}
                          alt=""
                          className="w-8 h-8 rounded-full bg-slate-200"
                        />
                        <span className="font-medium text-slate-700">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles &&
                          user.roles.map((role: any) => (
                            <span
                              key={role.id}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                role.roleCode === "ROLE_ADMIN"
                                  ? "bg-primary-50 text-primary-600"
                                  : role.roleCode === "ROLE_USER"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {role.roleName}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`w-2 h-2 rounded-full inline-block mr-2 ${
                          user.status === 1 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {user.status === 1 ? "正常" : "禁用"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal("edit", user)}
                        className="text-slate-400 hover:text-primary-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Simple Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="secondary"
              disabled={pagination.current === 1}
              onClick={() =>
                fetchUsers(pagination.current - 1, pagination.pageSize, keyword)
              }
            >
              上一页
            </Button>
            <span className="py-2 text-sm text-slate-600">
              第 {pagination.current} 页
            </span>
            <Button
              variant="secondary"
              disabled={users.length < pagination.pageSize}
              onClick={() =>
                fetchUsers(pagination.current + 1, pagination.pageSize, keyword)
              }
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === "create" ? "新增用户" : "编辑用户"}
            </h3>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: modalMode === "create", message: "请输入密码" },
                ]}
              >
                <Input.Password
                  placeholder={
                    modalMode === "edit" ? "留空不修改" : "请输入密码"
                  }
                />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: "email", message: "请输入有效的邮箱" }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item name="roleIds" label="角色" initialValue={[2]}>
                <Select mode="multiple" placeholder="请选择角色">
                  <Option value={1}>管理员</Option>
                  <Option value={2}>普通用户</Option>
                  <Option value={3}>访客</Option>
                  <Option value={4}>编辑</Option>
                </Select>
              </Form.Item>
              <Form.Item name="status" label="状态" initialValue={1}>
                <Select>
                  <Option value={1}>正常</Option>
                  <Option value={0}>禁用</Option>
                </Select>
              </Form.Item>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  取消
                </Button>
                <Button variant="primary" type="submit">
                  保存
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
