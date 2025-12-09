import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Button } from '@/components/ui/LayoutComponents';
import { Download, Upload } from 'lucide-react';
import { excelApi } from '@/services/api';
import { message } from 'antd'; // Import message from antd

const ExcelPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response: any = await excelApi.import(file);

      if (response.code === 200) {
        setHeaders(response.data.headers);
        setData(response.data.data);
        setFileName(response.data.fileName);
        message.success('导入成功'); // Use message.success
      } else {
        message.error('导入失败：' + response.message); // Use message.error
      }
    } catch (error) {
      message.error('导入失败，请检查文件格式'); // Use message.error
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      await excelApi.export({ headers, data });
      message.success('导出成功'); // Use message.success
    } catch (error) {
      message.error('导出失败'); // Use message.error
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Excel 管理"
        actions={
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="secondary">
                <Upload size={16} /> 导入 Excel
              </Button>
            </div>
            <Button onClick={handleExport} disabled={data.length === 0} variant="primary">
              <Download size={16} /> 导出 Excel
            </Button>
          </div>
        }
      >
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <p className="mb-4 text-sm text-slate-500">正在预览: <span className="font-semibold text-slate-800">{fileName}</span></p>
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-6 py-3 border-b">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="bg-white border-b hover:bg-slate-50">
                    {row.map((cell: any, cellIdx: number) => (
                      <td key={cellIdx} className="px-6 py-4">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
            <Upload className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">暂无数据</p>
            <p className="text-slate-400 text-sm mt-1">请上传 Excel 文件以查看和编辑数据</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExcelPage;