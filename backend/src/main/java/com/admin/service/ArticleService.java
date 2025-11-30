package com.admin.service;

import com.admin.entity.Article;
import com.admin.mapper.ArticleMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 文章服务
 */
@Service
public class ArticleService extends ServiceImpl<ArticleMapper, Article> {
    
    /**
     * 分页查询文章列表
     */
    public Page<Article> getArticlePage(int page, int size) {
        Page<Article> pageParam = new Page<>(page, size);
        QueryWrapper<Article> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("create_time");
        return page(pageParam, wrapper);
    }
    
    /**
     * 查询所有文章
     */
    public List<Article> getAllArticles() {
        QueryWrapper<Article> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("create_time");
        return list(wrapper);
    }
    
    /**
     * 根据ID查询文章
     */
    public Article getArticleById(Long id) {
        return getById(id);
    }
    
    /**
     * 保存文章（新增或更新）
     */
    public boolean saveArticle(Article article) {
        return saveOrUpdate(article);
    }
    
    /**
     * 删除文章
     */
    public boolean deleteArticle(Long id) {
        return removeById(id);
    }
}
