import React, { useState } from 'react';
import { Card, Button } from '../../components/ui/LayoutComponents';
import { Save } from 'lucide-react';
import { articleApi } from '../../services/api';
import { message } from 'antd'; // Added message import

const Editor: React.FC = () => {
  const [content, setContent] = useState('# 你好，世界\n\n在这里开始撰写你的精彩文章...');
  const [title, setTitle] = useState('新文章');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response: any = await articleApi.save({
        title,
        content,
        authorId: 1, // 简化处理，实际应从登录信息获取
        status: 1,
      });

      if (response.code === 200) {
        message.success('文章保存成功！'); // Replaced alert with message.success
      } else {
        message.error('保存失败：' + response.message); // Replaced alert with message.error
      }
    } catch (error) {
      console.error('保存失败:', error); // Added console.error for debugging
      message.error('保存失败，请检查网络连接'); // Replaced alert with message.error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <Card
        title="Markdown 编辑器"
        className="flex-1 flex flex-col"
        actions={
          <Button onClick={handleSave} variant="primary" disabled={saving}>
            <Save size={16} /> {saving ? '保存中...' : '保存文章'}
          </Button>
        }
      >
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="请输入文章标题"
          />
        </div>
        <div className="flex-1 h-full">
          <textarea
            className="w-full h-full p-4 border rounded-md font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# 在此输入 Markdown 内容..."
          />
        </div>
      </Card>
    </div>
  );
};

export default Editor;