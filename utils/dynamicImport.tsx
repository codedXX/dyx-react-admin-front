import React, { ComponentType, Suspense } from "react";

// 使用 Vite 的 import.meta.glob 预加载所有组件
// 这样 Vite 可以在构建时分析并正确处理动态导入
const modules = import.meta.glob("../views/**/*.tsx");

// 组件缓存
const componentCache = new Map<string, ComponentType<any>>();

/**
 * 动态加载组件（使用 import.meta.glob）
 * @param path 路由路径，如 /dashboard, /system/menu
 * @returns React 组件
 */
export const loadComponent = (path: string): ComponentType<any> => {
  // 检查缓存
  if (componentCache.has(path)) {
    return componentCache.get(path)!;
  }

  const parts = path.split("/").filter(Boolean);

  // 生成多种可能的路径组合
  const possiblePaths: string[] = [];

  if (parts.length === 1) {
    // 单层路径：/dashboard
    const name = parts[0];
    possiblePaths.push(
      `../views/${name.charAt(0).toUpperCase() + name.slice(1)}.tsx`,
      `../views/${name.toLowerCase()}.tsx`,
      `../views/${name}.tsx`,
      // 支持 index.tsx 模式
      `../views/${name.charAt(0).toUpperCase() + name.slice(1)}/index.tsx`,
      `../views/${name.toLowerCase()}/index.tsx`,
      `../views/${name}/index.tsx`
    );
  } else if (parts.length === 2) {
    // 两层路径：/system/menu
    const [dir, file] = parts;
    const dirCapitalized = dir.charAt(0).toUpperCase() + dir.slice(1);
    const fileCapitalized = file.charAt(0).toUpperCase() + file.slice(1);

    possiblePaths.push(
      `../views/${dirCapitalized}/${fileCapitalized}.tsx`,
      `../views/${dirCapitalized}/${file.toLowerCase()}.tsx`,
      `../views/${dirCapitalized}/${file}.tsx`,
      `../views/${dir.toLowerCase()}/${fileCapitalized}.tsx`,
      `../views/${dir.toLowerCase()}/${file.toLowerCase()}.tsx`,
      `../views/${dir}/${file}.tsx`,
      // 支持 index.tsx 模式
      `../views/${dirCapitalized}/${fileCapitalized}/index.tsx`,
      `../views/${dirCapitalized}/${file.toLowerCase()}/index.tsx`,
      `../views/${dirCapitalized}/${file}/index.tsx`,
      `../views/${dir.toLowerCase()}/${fileCapitalized}/index.tsx`,
      `../views/${dir.toLowerCase()}/${file.toLowerCase()}/index.tsx`,
      `../views/${dir}/${file}/index.tsx`
    );
  } else {
    // 多层路径
    const componentPath = parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("/");
    possiblePaths.push(`../views/${componentPath}.tsx`);
  }

  // 查找匹配的模块
  let matchedModule: (() => Promise<any>) | null = null;
  let matchedPath = "";

  for (const possiblePath of possiblePaths) {
    if (modules[possiblePath]) {
      matchedModule = modules[possiblePath] as () => Promise<any>;
      matchedPath = possiblePath;
      break;
    }
  }

  // 创建组件
  const WrappedComponent: ComponentType<any> = (props: any) => {
    if (!matchedModule) {
      return (
        <div className="p-10 text-center">
          <div className="text-red-500 mb-2">组件加载失败</div>
          <div className="text-sm text-slate-500">路径: {path}</div>
          <div className="text-sm text-slate-500 mt-2">尝试过的路径:</div>
          <ul className="text-xs text-slate-400 mt-1">
            {possiblePaths.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div className="text-sm text-slate-500 mt-2">可用的组件:</div>
          <ul className="text-xs text-slate-400 mt-1">
            {Object.keys(modules)
              .slice(0, 10)
              .map((p, i) => (
                <li key={i}>{p}</li>
              ))}
          </ul>
        </div>
      );
    }

    const [Component, setComponent] = React.useState<ComponentType<any> | null>(
      null
    );
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      matchedModule!()
        .then((module) => {
          console.log(
            `✅ Successfully loaded: ${matchedPath} for path ${path}`
          );
          setComponent(() => module.default);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`❌ Failed to load: ${matchedPath}`, err);
          setError(err);
          setLoading(false);
        });
    }, []);

    if (loading) {
      return <div className="p-10 text-center text-slate-500">加载中...</div>;
    }

    if (error || !Component) {
      return (
        <div className="p-10 text-center">
          <div className="text-red-500 mb-2">组件加载失败</div>
          <div className="text-sm text-slate-500">路径: {path}</div>
          <div className="text-sm text-slate-500">错误: {error?.message}</div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  // 缓存组件
  componentCache.set(path, WrappedComponent);

  return WrappedComponent;
};

/**
 * 清除组件缓存（用于开发环境热更新）
 */
export const clearComponentCache = () => {
  componentCache.clear();
};
