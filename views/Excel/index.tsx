import React, { useState } from "react";
import { Card } from "@/components/ui/LayoutComponents";
import { Download, Upload } from "lucide-react";
import { excelApi } from "@/services/api";
import { message, Table, Button, Upload as AntUpload } from "antd";
import type { UploadProps } from "antd";

const ExcelPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx, .xls",
    showUploadList: false,
    beforeUpload: async (file) => {
      setUploading(true);
      try {
        const response = await excelApi.import(file);

        if (response.code === 200) {
          setHeaders(response.data.headers);
          setData(response.data.data);
          setFileName(response.data.fileName);
          message.success("导入成功");
        } else {
          message.error("导入失败：" + response.message);
        }
      } catch (error) {
        message.error("导入失败，请检查文件格式");
      } finally {
        setUploading(false);
      }
      return false; // 阻止自动上传
    },
  };

  const handleExport = async () => {
    try {
      await excelApi.export({ headers, data });
      message.success("导出成功");
    } catch (error) {
      message.error("导出失败");
    }
  };

  // 动态生成表格列
  const columns = headers.map((h, i) => ({
    title: h,
    dataIndex: i.toString(),
    key: i.toString(),
  }));

  // 转换数据格式
  const tableData = data.map((row, rowIndex) => {
    const rowData: any = { key: rowIndex };
    row.forEach((cell: any, cellIndex: number) => {
      rowData[cellIndex.toString()] = cell;
    });
    return rowData;
  });

  return (
    <div className="space-y-6">
      <Card
        title="Excel 管理"
        actions={
          <div className="flex gap-3">
            <AntUpload {...uploadProps}>
              <Button icon={<Upload size={16} />} loading={uploading}>
                导入 Excel
              </Button>
            </AntUpload>
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={handleExport}
              disabled={data.length === 0}
            >
              导出 Excel
            </Button>
          </div>
        }
      >
        {data.length > 0 ? (
          <div>
            <p className="mb-4 text-sm text-slate-500">
              正在预览:{" "}
              <span className="font-semibold text-slate-800">{fileName}</span>
            </p>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: "max-content" }}
              className="ant-table-custom"
            />
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
            <Upload className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">暂无数据</p>
            <p className="text-slate-400 text-sm mt-1">
              请上传 Excel 文件以查看和编辑数据
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExcelPage;
