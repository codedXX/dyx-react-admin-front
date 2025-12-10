import React, { useState } from "react";
import { Card } from "@/components/ui/LayoutComponents";
import { Save } from "lucide-react";
import { articleApi } from "@/services/api";
import { message, Input, Button } from "antd";

const { TextArea } = Input;

const Editor: React.FC = () => {
  const [content, setContent] = useState(
    "# 你好，世界\n\n在这里开始撰写你的精彩文章..."
  );
  const [title, setTitle] = useState("新文章");
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
        message.success("文章保存成功！");
      } else {
        message.error("保存失败：" + response.message);
      }
    } catch (error) {
      console.error("保存失败:", error);
      message.error("保存失败，请检查网络连接");
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
          <Button
            type="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            loading={saving}
          >
            {saving ? "保存中..." : "保存文章"}
          </Button>
        }
      >
        <div className="mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题"
            size="large"
          />
        </div>
        <div className="flex-1 h-full">
          <TextArea
            className="font-mono text-sm bg-slate-50 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# 在此输入 Markdown 内容..."
            style={{ height: "calc(100vh - 340px)", minHeight: 300 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Editor;
