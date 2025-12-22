import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/LayoutComponents";
import { Edit, Trash, Plus } from "lucide-react";
import { userApi } from "@/services/api";
import {
  message,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { User, Role } from "@/types";
import "./User.scss";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      if (response.code === 200) {
        setUsers(response.data.records);
        setPagination({
          current: response.data.current,
          pageSize: response.data.size,
          total: response.data.total,
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
  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchUsers(1, pagination.pageSize, value);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const response = await userApi.delete(id);
      if (response.code === 200) {
        message.success("删除成功");
        fetchUsers(pagination.current, pagination.pageSize, keyword);
      } else {
        message.error("删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  // 打开模态框
  const openModal = (mode: "create" | "edit", user?: User) => {
    setModalMode(mode);
    setCurrentUser(user || null);
    setIsModalOpen(true);
    if (mode === "edit" && user) {
      // 转换角色数据用于回显
      const roleIds = user.roles ? user.roles.map((r: Role) => r.id) : [];
      form.setFieldsValue({
        ...user,
        password: "",
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

      const submitData = {
        ...values,
        roleIds: values.roleIds,
      };

      if (modalMode === "create") {
        response = await userApi.create(submitData);
      } else {
        response = await userApi.update(currentUser!.id, submitData);
      }

      if (response.code === 200) {
        message.success(modalMode === "create" ? "新增成功" : "更新成功");
        setIsModalOpen(false);
        fetchUsers(pagination.current, pagination.pageSize, keyword);
      } else {
        message.error(response.message || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  // 表格列配置
  const columns: ColumnsType<User> = [
    {
      title: "用户",
      dataIndex: "username",
      key: "username",
      render: (text: string, record: User) => (
        <div className="flex items-center gap-3">
          <img
            src={record.avatar || "https://via.placeholder.com/40"}
            alt=""
            className="w-8 h-8 rounded-full bg-slate-200"
          />
          <span className="font-medium text-slate-700">{text}</span>
        </div>
      ),
    },
    {
      title: "角色",
      dataIndex: "roles",
      key: "roles",
      render: (roles: Role[]) => (
        <Space size={4} wrap>
          {roles?.map((role: Role) => (
            <Tag
              key={role.id}
              color={role.roleCode === "ROLE_ADMIN" ? "blue" : "default"}
            >
              {role.roleName}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "error"}>
          {status === 1 ? "正常" : "禁用"}
        </Tag>
      ),
    },
    {
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => openModal("edit", record)}
            className="text-slate-400 hover:text-primary-600"
          />
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              icon={<Trash size={16} />}
              className="text-slate-400 hover:text-red-600"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理表格分页变化
  const handleTableChange = (newPagination: any) => {
    fetchUsers(newPagination.current, newPagination.pageSize, keyword);
  };

  return (
    <>
      <Card
        title="用户管理"
        actions={
          <Space>
            <Input.Search
              placeholder="搜索用户名/邮箱"
              allowClear
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => openModal("create")}
            >
              新增用户
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          className="ant-table-custom"
        />
      </Card>

      {/* Modal */}
      <Modal
        title={modalMode === "create" ? "新增用户" : "编辑用户"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label={modalMode === "create" ? "密码" : "新密码"}
            rules={[
              { required: modalMode === "create", message: "请输入密码" },
            ]}
          >
            <Input.Password
              placeholder={modalMode === "edit" ? "留空不修改" : "请输入密码"}
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
              <Select.Option value={1}>管理员</Select.Option>
              <Select.Option value={2}>普通用户</Select.Option>
              <Select.Option value={3}>访客</Select.Option>
              <Select.Option value={4}>编辑</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserManagement;
