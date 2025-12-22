import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/LayoutComponents";
import {
  Edit,
  Trash,
  Plus,
  Folder,
  FileText,
  MousePointer,
} from "lucide-react";
import { menuApi } from "@/services/api";
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
  TreeSelect,
  Tag,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MenuItem } from "@/types";

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentMenu, setCurrentMenu] = useState<Partial<MenuItem>>({});
  const [form] = Form.useForm();

  const loadMenus = async () => {
    try {
      const response = await menuApi.getTree();
      if (response.code === 200) {
        setMenus(response.data);
      }
    } catch (error) {
      console.error("加载菜单列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await menuApi.delete(id);
      if (response.code === 200) {
        message.success("删除成功");
        loadMenus();
      } else {
        message.error("删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  const openModal = (mode: "create" | "edit", menu?: MenuItem) => {
    setModalMode(mode);
    if (mode === "edit" && menu) {
      setCurrentMenu(menu);
      form.setFieldsValue({
        title: menu.title,
        path: menu.path,
        icon: menu.icon || "",
        parentId: Number(menu.parentId) || undefined,
        keepAlive: menu.keepAlive || 1,
        sortOrder: menu.sortOrder,
        type: menu.type || "menu",
        permission: menu.permission || "",
      });
    } else {
      setCurrentMenu({});
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let response;
      const dataToSubmit = {
        ...values,
        parentId: values.parentId || 0,
      };

      if (modalMode === "create") {
        response = await menuApi.create(dataToSubmit);
      } else {
        response = await menuApi.update(Number(currentMenu.id!), dataToSubmit);
      }

      if (response.code === 200) {
        message.success(modalMode === "create" ? "新增成功" : "更新成功");
        setIsModalOpen(false);
        loadMenus();
      } else {
        message.error(response.message || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  // 扁平化菜单数据用于表格展示
  const flattenMenus = (
    items: MenuItem[],
    level = 0
  ): (MenuItem & { level: number })[] => {
    return items.reduce((acc: (MenuItem & { level: number })[], item) => {
      acc.push({ ...item, level });
      if (item.children) {
        acc.push(...flattenMenus(item.children, level + 1));
      }
      return acc;
    }, []);
  };

  // 表格列配置
  const columns: ColumnsType<MenuItem & { level: number }> = [
    {
      title: "菜单标题",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: MenuItem & { level: number }) => (
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${(record.level || 0) * 24}px` }}
        >
          {record.type === "button" ? (
            <MousePointer size={16} className="text-orange-400" />
          ) : record.children && record.children.length > 0 ? (
            <Folder size={16} className="text-primary-400" />
          ) : (
            <FileText size={16} className="text-slate-400" />
          )}
          <span className="font-medium text-slate-700">{text}</span>
        </div>
      ),
    },
    {
      title: "路由路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "button" ? "orange" : "blue"}>
          {type === "button" ? "按钮" : "菜单"}
        </Tag>
      ),
    },
    {
      title: "权限标识",
      dataIndex: "permission",
      key: "permission",
      render: (text: string) => (
        <span className="font-mono text-xs text-slate-500">{text}</span>
      ),
    },
    {
      title: "图标",
      dataIndex: "icon",
      key: "icon",
      render: (icon: string) =>
        icon ? <Tag className="bg-slate-100">{icon}</Tag> : null,
    },
    {
      title: "缓存",
      dataIndex: "keepAlive",
      key: "keepAlive",
      render: (keepAlive: number) => (
        <Tag color={keepAlive === 1 ? "success" : "default"}>
          {keepAlive === 1 ? "开启" : "关闭"}
        </Tag>
      ),
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      key: "sortOrder",
    },
    {
      title: "操作",
      key: "action",
      align: "right",
      render: (_: any, record: MenuItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => openModal("edit", record)}
            className="text-slate-400 hover:text-primary-600"
          />
          <Popconfirm
            title="确认删除该菜单吗？"
            onConfirm={() => handleDelete(Number(record.id))}
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

  // 监听类型变化
  const menuType = Form.useWatch("type", form);

  return (
    <>
      <Card
        title="菜单管理"
        actions={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => openModal("create")}
          >
            新增菜单
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={flattenMenus(menus)}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="ant-table-custom"
        />
      </Card>

      {/* Modal */}
      <Modal
        title={modalMode === "create" ? "新增菜单" : "编辑菜单"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{ type: "menu", keepAlive: 1, sortOrder: 0 }}
        >
          <Form.Item
            name="title"
            label="菜单标题"
            rules={[{ required: true, message: "请输入菜单标题" }]}
          >
            <Input placeholder="请输入菜单标题" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "menu" ? (
                <Form.Item name="path" label="路由路径">
                  <Input placeholder="按钮类型可留空" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Space className="w-full" size="middle">
            <Form.Item name="type" label="类型" className="flex-1">
              <Select>
                <Select.Option value="menu">菜单</Select.Option>
                <Select.Option value="button">按钮</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="permission" label="权限标识" className="flex-1">
              <Input placeholder="如 user:add" />
            </Form.Item>
          </Space>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "menu" ? (
                <Form.Item name="icon" label="图标 (Lucide Icon Name)">
                  <Input placeholder="请输入图标名称" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="parentId" label="父级菜单">
            <TreeSelect
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              treeData={menus}
              placeholder="请选择父级菜单 (留空为顶级菜单)"
              treeDefaultExpandAll
              allowClear
              fieldNames={{
                label: "title",
                value: "id",
                children: "children",
              }}
            />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "menu" ? (
                <Form.Item name="keepAlive" label="是否缓存">
                  <Select>
                    <Select.Option value={1}>开启</Select.Option>
                    <Select.Option value={0}>关闭</Select.Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MenuManagement;
