import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '../../components/ui/LayoutComponents';
import { articleApi } from '../../services/api';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Article {
  id: number;
  title: string;
  content: string;
}

import { useLocation } from 'react-router-dom';

// ... (imports)

const Preview: React.FC = () => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // 加载文章列表
  const loadArticles = async () => {
    setLoading(true);
    try {
      const response: any = await articleApi.getList(0, 10);
      if (response.code === 200 && response.data.length > 0) {
        setArticles(response.data);
        // 如果当前没有选中文章，或者列表更新了，默认显示第一篇
        // 这里简单处理：总是显示第一篇，或者保持当前选中的（如果还在列表中）
        // 为了响应“刷新页面”，我们默认重置为第一篇，或者根据URL参数（如果有）
        setCurrentArticle(response.data[0]);
      }
    } catch (error) {
      console.error('加载文章失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 仅当进入预览页时刷新
    if (location.pathname === '/article/preview') {
      loadArticles();
    }
  }, [location.pathname]);

  // Parse Headers for TOC
  useEffect(() => {
    if (!currentArticle?.content) return;

    const lines = currentArticle.content.split('\n');
    const items: TocItem[] = [];
    let slugCounts: Record<string, number> = {};

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        let slug = text.trim();

        if (slugCounts[slug]) {
          slugCounts[slug]++;
          slug = `${slug}-${slugCounts[slug]}`;
        } else {
          slugCounts[slug] = 1;
        }

        items.push({ id: slug, text, level });
      }
    });
    setToc(items);
  }, [currentArticle]);

  // Intersection Observer for Scroll Spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    const headings = contentRef.current?.querySelectorAll('h1, h2, h3');
    headings?.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [toc]);

  // Custom renderer to add IDs to headings
  const components = {
    h1: ({ children, ...props }: any) => {
      const id = children?.toString().trim();
      return <h1 id={id} className="text-3xl font-bold mb-4 mt-8 text-slate-800 border-b pb-2" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const id = children?.toString().trim();
      return <h2 id={id} className="text-2xl font-semibold mb-3 mt-6 text-slate-700" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const id = children?.toString().trim();
      return <h3 id={id} className="text-xl font-medium mb-2 mt-4 text-slate-600" {...props}>{children}</h3>;
    },
    p: ({ children }: any) => <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4 text-slate-600">{children}</ul>,
    code: ({ inline, className, children, ...props }: any) => {
      return inline ?
        <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-500 font-mono text-sm" {...props}>{children}</code> :
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props}>{children}</pre>
    }
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  if (loading) {
    return <div className="text-center py-10">加载中...</div>;
  }

  if (!currentArticle) {
    return <div className="text-center py-10">暂无文章</div>;
  }

  return (
    <div className="flex gap-6 relative items-start">
      {/* Article Content */}
      <div className="flex-1 min-w-0">
        <Card className="min-h-screen">
          {articles.length > 1 && (
            <div className="mb-6 pb-4 border-b">
              <label className="text-sm font-medium text-slate-600 mb-2 block">选择文章：</label>
              <select
                value={currentArticle.id}
                onChange={(e) => setCurrentArticle(articles.find(a => a.id === Number(e.target.value)) || null)}
                className="w-full md:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="markdown-body" ref={contentRef}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {currentArticle.content}
            </ReactMarkdown>
          </div>
        </Card>
      </div>

      {/* Sticky TOC */}
      <div className="w-64 hidden xl:block sticky top-24 shrink-0">
        <Card title="文章目录" className="max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="space-y-1 relative">
            {/* Simple Active Indicator Line */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100" />

            {toc.map((item) => (
              <div
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  cursor-pointer text-sm py-1 pl-4 border-l-2 transition-all duration-200
                  ${activeId === item.id
                    ? 'border-primary-500 text-primary-600 font-medium bg-primary-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}
                `}
                style={{ marginLeft: `${(item.level - 1) * 12}px` }}
              >
                {item.text}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Preview;