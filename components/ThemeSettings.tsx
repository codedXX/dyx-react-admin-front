import React, { useState } from "react";
import { Drawer, ColorPicker, Divider } from "antd";
import { Settings, Check } from "lucide-react";
import { useThemeStore } from "@/store";
import { Color } from "antd/es/color-picker";

const PRESET_COLORS = [
  "#4f46e5", // Indigo (Default)
  "#1677ff", // Blue (Ant Design Default)
  "#722ed1", // Purple
  "#eb2f96", // Magenta
  "#f5222d", // Red
  "#fa8c16", // Orange
  "#52c41a", // Green
  "#13c2c2", // Cyan
];

const ThemeSettings: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { primaryColor, setPrimaryColor } = useThemeStore();

  const handleColorChange = (value: Color | string) => {
    const colorHex = typeof value === "string" ? value : value.toHexString();
    setPrimaryColor(colorHex);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ml-2 text-slate-400 hover:text-primary-600 transition-colors"
        title="主题设置"
      >
        <Settings size={18} />
      </button>

      <Drawer
        title="主题设置"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={300}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">主题色</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {PRESET_COLORS.map((color) => (
                <div
                  key={color}
                  className="w-8 h-8 rounded cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                >
                  {primaryColor.toLowerCase() === color.toLowerCase() && (
                    <Check size={16} className="text-white" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">自定义颜色</span>
              <ColorPicker
                value={primaryColor}
                onChange={handleColorChange}
                showText
              />
            </div>
          </div>

          <Divider />

          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              界面显示
            </h3>
            <p className="text-xs text-slate-500">更多配置项开发中...</p>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ThemeSettings;
