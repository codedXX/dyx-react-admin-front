import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useThemeStore } from "@/store";
import { router } from "@/router";

// ---- App 主组件 ----

const App = () => {
  const { primaryColor } = useThemeStore();

  useEffect(() => {
    // 为 Tailwind 生成 CSS 变量
    const root = document.documentElement;
    root.style.setProperty("--primary-color", primaryColor);

    // 简化的色阶生成（生产环境建议使用 tinycolor2 或 colord 库）
    const hex2rgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const [r, g, b] = hex2rgb(primaryColor);

    // 定义色阶映射（近似值）
    const shades = {
      50: 0.95,
      100: 0.9,
      200: 0.8,
      300: 0.7,
      400: 0.6,
      500: 0, // 基础色
      600: -0.1,
      700: -0.2,
      800: -0.3,
      900: -0.4,
      950: -0.5,
    };

    Object.entries(shades).forEach(([shade, factor]) => {
      let newR, newG, newB;
      if (factor > 0) {
        // 与白色混合（变浅）
        newR = r + (255 - r) * factor;
        newG = g + (255 - g) * factor;
        newB = b + (255 - b) * factor;
      } else {
        // 与黑色混合（变深）
        const f = 1 + factor; // factor 是负数
        newR = r * f;
        newG = g * f;
        newB = b * f;
      }
      root.style.setProperty(
        `--primary-${shade}`,
        `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`
      );
    });
  }, [primaryColor]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
