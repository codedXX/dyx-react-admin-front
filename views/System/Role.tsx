import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui/LayoutComponents';
import { Edit, Trash, Plus, Shield, Settings } from 'lucide-react';
import { roleApi, menuApi } from '../../services/api';
import { message } from 'antd';

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
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRole, setCurrentRole] = useState<Partial<IRole>>({});
    const [formData, setFormData] = useState({
        roleName: '',
        roleCode: '',
        description: ''
    });

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
            console.error('加载角色列表失败', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadRoles();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('确认删除该角色吗？')) {
            try {
                const response: any = await roleApi.delete(id);
                if (response.code === 200) {
                    message.success('删除成功');
                    loadRoles();
                } else {
                    message.error('删除失败');
                }
            } catch (error) {
                console.error('删除失败:', error);
                message.error('删除失败');
            }
        }
    };

    const openModal = (mode: 'create' | 'edit', role?: IRole) => {
        setModalMode(mode);
        if (mode === 'edit' && role) {
            setCurrentRole(role);
            setFormData({
                roleName: role.roleName,
                roleCode: role.roleCode,
                description: role.description
            });
        } else {
            setCurrentRole({});
            setFormData({
                roleName: '',
                roleCode: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response: any;
            if (modalMode === 'create') {
                response = await roleApi.create(formData);
            } else {
                response = await roleApi.update(currentRole.id!, formData);
            }

            if (response.code === 200) {
                message.success(modalMode === 'create' ? '新增成功' : '更新成功');
                setIsModalOpen(false);
                loadRoles();
            } else {
                message.error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
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
            console.error('加载权限数据失败', error);
            message.error('加载权限数据失败');
        }
    };

    const handlePermSubmit = async () => {
        if (!permRoleId) return;
        try {
            const response: any = await roleApi.assignMenus(permRoleId, checkedKeys);
            if (response.code === 200) {
                message.success('权限分配成功');
                setIsPermModalOpen(false);
            } else {
                message.error('权限分配失败');
            }
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
        }
    };

    const toggleCheck = (id: number) => {
        setCheckedKeys(prev =>
            prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
        );
    };

    // Recursive Tree Renderer
    const renderTree = (nodes: IMenuNode[]) => {
        return (
            <ul className="pl-4 space-y-2">
                {nodes.map(node => (
                    <li key={node.id}>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={checkedKeys.includes(node.id)}
                                onChange={() => toggleCheck(node.id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">{node.title}</span>
                        </div>
                        {node.children && node.children.length > 0 && renderTree(node.children)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <Card
                title="角色管理"
                actions={
                    <div className="flex gap-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="搜索角色名/代码"
                                className="px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Button variant="secondary" onClick={handleSearch}>搜索</Button>
                        </form>
                        <Button variant="primary" onClick={() => openModal('create')}>
                            <Plus size={16} /> 新增角色
                        </Button>
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 font-medium">角色名称</th>
                                <th className="px-4 py-3 font-medium">角色代码</th>
                                <th className="px-4 py-3 font-medium">描述</th>
                                <th className="px-4 py-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-4">加载中...</td></tr>
                            ) : roles.map((role) => (
                                <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-indigo-500" />
                                            <span className="font-medium text-slate-700">{role.roleName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600">
                                            {role.roleCode}
                                        </code>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{role.description}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            onClick={() => openPermModal(role.id)}
                                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                                            title="分配权限"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={() => openModal('edit', role)}
                                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                                            title="编辑"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                            title="删除"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4 gap-2">
                        <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
                        <span className="py-2 text-sm text-slate-600">第 {page} 页</span>
                        <Button variant="secondary" disabled={roles.length < 10} onClick={() => setPage(p => p + 1)}>下一页</Button>
                    </div>
                </div>
            </Card>

            {/* Role Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">{modalMode === 'create' ? '新增角色' : '编辑角色'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">角色名称</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.roleName}
                                    onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">角色代码</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.roleCode}
                                    onChange={e => setFormData({ ...formData, roleCode: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>取消</Button>
                                <Button variant="primary" type="submit">保存</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Permission Modal */}
            {isPermModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl flex flex-col max-h-[80vh]">
                        <h3 className="text-lg font-semibold mb-4">分配菜单权限</h3>
                        <div className="flex-1 overflow-y-auto border rounded p-4">
                            {renderTree(menuTree)}
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <Button variant="secondary" type="button" onClick={() => setIsPermModalOpen(false)}>取消</Button>
                            <Button variant="primary" onClick={handlePermSubmit}>保存权限</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoleManagement;
