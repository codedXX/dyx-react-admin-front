import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui/LayoutComponents';
import { Edit, Trash, Plus, Folder, FileText } from 'lucide-react';
import { menuApi } from '../../services/api';
import { message, TreeSelect } from 'antd';

interface IMenu {
    id: number;
    title: string;
    path: string;
    icon: string;
    parentId: number;
    keepAlive: number;
    sortOrder: number;
    children?: IMenu[];
}

const MenuManagement: React.FC = () => {
    const [menus, setMenus] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentMenu, setCurrentMenu] = useState<Partial<IMenu>>({});
    const [formData, setFormData] = useState({
        title: '',
        path: '',
        icon: '',
        parentId: 0,
        keepAlive: 1,
        sortOrder: 0
    });

    const loadMenus = async () => {
        try {
            const response: any = await menuApi.getTree();
            if (response.code === 200) {
                setMenus(response.data);
            }
        } catch (error) {
            console.error('加载菜单列表失败', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('确认删除该菜单吗？')) {
            try {
                const response: any = await menuApi.delete(id);
                if (response.code === 200) {
                    message.success('删除成功');
                    loadMenus();
                } else {
                    message.error('删除失败');
                }
            } catch (error) {
                console.error('删除失败:', error);
                message.error('删除失败');
            }
        }
    };

    const openModal = (mode: 'create' | 'edit', menu?: IMenu) => {
        setModalMode(mode);
        if (mode === 'edit' && menu) {
            setCurrentMenu(menu);
            setFormData({
                title: menu.title,
                path: menu.path,
                icon: menu.icon || '',
                parentId: menu.parentId,
                keepAlive: menu.keepAlive,
                sortOrder: menu.sortOrder
            });
        } else {
            setCurrentMenu({});
            setFormData({
                title: '',
                path: '',
                icon: '',
                parentId: 0,
                keepAlive: 1,
                sortOrder: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response: any;
            if (modalMode === 'create') {
                response = await menuApi.create(formData);
            } else {
                response = await menuApi.update(currentMenu.id!, formData);
            }

            if (response.code === 200) {
                message.success(modalMode === 'create' ? '新增成功' : '更新成功');
                setIsModalOpen(false);
                loadMenus();
            } else {
                message.error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
        }
    };

    // 递归渲染菜单行
    const renderMenuRows = (items: IMenu[], level = 0) => {
        return items.map((menu) => (
            <React.Fragment key={menu.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                            {menu.children && menu.children.length > 0 ? (
                                <Folder size={16} className="text-primary-400" />
                            ) : (
                                <FileText size={16} className="text-slate-400" />
                            )}
                            <span className="font-medium text-slate-700">{menu.title}</span>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{menu.path}</td>
                    <td className="px-4 py-3">
                        {menu.icon && (
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                                {menu.icon}
                            </span>
                        )}
                    </td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${menu.keepAlive === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {menu.keepAlive === 1 ? '开启' : '关闭'}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{menu.sortOrder}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                        <button
                            onClick={() => openModal('edit', menu)}
                            className="text-slate-400 hover:text-primary-600 transition-colors"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(menu.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                            <Trash size={16} />
                        </button>
                    </td>
                </tr>
                {menu.children && renderMenuRows(menu.children, level + 1)}
            </React.Fragment>
        ));
    };

    return (
        <>
            <Card
                title="菜单管理"
                actions={
                    <Button variant="primary" onClick={() => openModal('create')}>
                        <Plus size={16} /> 新增菜单
                    </Button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 font-medium">菜单标题</th>
                                <th className="px-4 py-3 font-medium">路由路径</th>
                                <th className="px-4 py-3 font-medium">图标</th>
                                <th className="px-4 py-3 font-medium">缓存</th>
                                <th className="px-4 py-3 font-medium">排序</th>
                                <th className="px-4 py-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4">加载中...</td></tr>
                            ) : renderMenuRows(menus)}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">{modalMode === 'create' ? '新增菜单' : '编辑菜单'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">菜单标题</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">路由路径</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.path}
                                    onChange={e => setFormData({ ...formData, path: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">图标 (Lucide Icon Name)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">父级菜单</label>
                                <TreeSelect
                                    style={{ width: '100%' }}
                                    value={formData.parentId === 0 ? undefined : formData.parentId}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    treeData={menus}
                                    placeholder="请选择父级菜单 (留空为顶级菜单)"
                                    treeDefaultExpandAll
                                    allowClear
                                    fieldNames={{ label: 'title', value: 'id', children: 'children' }}
                                    onChange={(value) => setFormData({ ...formData, parentId: value || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">排序</label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">是否缓存</label>
                                <select
                                    value={formData.keepAlive}
                                    onChange={e => setFormData({ ...formData, keepAlive: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value={1}>开启</option>
                                    <option value={0}>关闭</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>取消</Button>
                                <Button variant="primary" type="submit">保存</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default MenuManagement;
