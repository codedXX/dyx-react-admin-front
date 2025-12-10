import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/LayoutComponents";
import { Edit, Trash, Plus, Shield, Settings } from "lucide-react";
import { roleApi, menuApi } from "@/services/api";
import {
  message,
  Modal,
  Form,
  Input,
  Table,
  Button,
  Space,
  Popconfirm,
  Tree,
} from "antd";
import type { ColumnsType } from "antd/es/table";

interface IRole {
  id: number;
  roleName: string;
  roleCode: string;
  description: string;
}

interface IMenuNode {
  id: number;
  title: string;
  children?: IMenuNode[];
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentRole, setCurrentRole] = useState<Partial<IRole>>({});
  const [form] = Form.useForm();

  // Permission Modal State
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permRoleId, setPermRoleId] = useState<number | null>(null);
  const [menuTree, setMenuTree] = useState<IMenuNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response: any = await roleApi.getAll(page, 10, keyword);
      if (response.code === 200) {
        setRoles(response.data.records);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("加载角色列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
    loadRoles();
  };

  const handleDelete = async (id: number) => {
    try {
      const response: any = await roleApi.delete(id);
      if (response.code === 200) {
        message.success("删除成功");
        loadRoles();
      } else {
        message.error("删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  const openModal = (mode: "create" | "edit", role?: IRole) => {
    setModalMode(mode);
    if (mode === "edit" && role) {
      setCurrentRole(role);
      form.setFieldsValue({
        roleName: role.roleName,
        roleCode: role.roleCode,
        description: role.description,
      });
    } else {
      setCurrentRole({});
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let response: any;
      if (modalMode === "create") {
        response = await roleApi.create(values);
      } else {
        response = await roleApi.update(currentRole.id!, values);
      }

      if (response.code === 200) {
        message.success(modalMode === "create" ? "新增成功" : "更新成功");
        setIsModalOpen(false);
        loadRoles();
      } else {
        message.error(response.message || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  // Permission Handling
  const openPermModal = async (roleId: number) => {
    setPermRoleId(roleId);
    try {
      // Load full menu tree
      const treeRes: any = await menuApi.getTree();
      if (treeRes.code === 200) {
        setMenuTree(treeRes.data);
      }
      // Load role's current permissions
      const permRes: any = await roleApi.getMenus(roleId);
      if (permRes.code === 200) {
        setCheckedKeys(permRes.data);
      }
      setIsPermModalOpen(true);
    } catch (error) {
      console.error("加载权限数据失败", error);
      message.error("加载权限数据失败");
    }
  };

  const handlePermSubmit = async () => {
    if (!permRoleId) return;
    try {
      const response: any = await roleApi.assignMenus(permRoleId, checkedKeys);
      if (response.code === 200) {
        message.success("权限分配成功");
        setIsPermModalOpen(false);
      } else {
        message.error("权限分配失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  // 转换菜单树为 Ant Design Tree 格式
  const convertToTreeData = (nodes: IMenuNode[]): any[] => {
    return nodes.map((node) => ({
      key: node.id,
      title: node.title,
      children: node.children ? convertToTreeData(node.children) : undefined,
    }));
  };

  // 表格列配置
  const columns: ColumnsType<IRole> = [
    {
      title: "角色名称",
      dataIndex: "roleName",
      key: "roleName",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-indigo-500" />
          <span className="font-medium text-slate-700">{text}</span>
        </div>
      ),
    },
    {
      title: "角色代码",
      dataIndex: "roleCode",
      key: "roleCode",
      render: (text: string) => (
        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600">
          {text}
        </code>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作",
      key: "action",
      align: "right",
      render: (_: any, record: IRole) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Settings size={16} />}
            onClick={() => openPermModal(record.id)}
            className="text-slate-400 hover:text-emerald-600"
            title="分配权限"
          />
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => openModal("edit", record)}
            className="text-slate-400 hover:text-indigo-600"
            title="编辑"
          />
          <Popconfirm
            title="确认删除该角色吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              icon={<Trash size={16} />}
              className="text-slate-400 hover:text-red-600"
              title="删除"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="角色管理"
        actions={
          <Space>
            <Input.Search
              placeholder="搜索角色名/代码"
              allowClear
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => openModal("create")}
            >
              新增角色
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total: total,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p) => setPage(p),
          }}
          className="ant-table-custom"
        />
      </Card>

      {/* Role Edit Modal */}
      <Modal
        title={modalMode === "create" ? "新增角色" : "编辑角色"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: "请输入角色名称" }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="roleCode"
            label="角色代码"
            rules={[{ required: true, message: "请输入角色代码" }]}
          >
            <Input placeholder="请输入角色代码" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Permission Modal */}
      <Modal
        title="分配菜单权限"
        open={isPermModalOpen}
        onOk={handlePermSubmit}
        onCancel={() => setIsPermModalOpen(false)}
        okText="保存权限"
        cancelText="取消"
        width={500}
      >
        <div className="max-h-96 overflow-y-auto border rounded p-4 mt-4">
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys}
            onCheck={(checked: any) => setCheckedKeys(checked as number[])}
            treeData={convertToTreeData(menuTree)}
          />
        </div>
      </Modal>
    </>
  );
};

export default RoleManagement;
