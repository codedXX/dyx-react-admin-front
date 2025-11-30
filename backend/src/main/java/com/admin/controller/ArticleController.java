package com.admin.controller;

import com.admin.dto.ApiResponse;
import com.admin.entity.Article;
import com.admin.service.ArticleService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文章控制器
 */
@RestController
@RequestMapping("/api/articles")
public class ArticleController {
    
    @Autowired
    private ArticleService articleService;
    
    /**
     * 分页查询文章列表
     */
    @GetMapping
    public ApiResponse<List<Article>> getArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (page <= 0) {
            // 不分页，查询所有
            List<Article> articles = articleService.getAllArticles();
            return ApiResponse.success(articles);
        }
        Page<Article> articlePage = articleService.getArticlePage(page, size);
        return ApiResponse.success(articlePage.getRecords());
    }
    
    /**
     * 根据ID查询文章
     */
    @GetMapping("/{id}")
    public ApiResponse<Article> getArticleById(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        return ApiResponse.success(article);
    }
    
    /**
     * 保存文章
     */
    @PostMapping
    public ApiResponse<Void> saveArticle(@RequestBody Article article) {
        boolean success = articleService.saveArticle(article);
        return success ? ApiResponse.success() : ApiResponse.error("保存失败");
    }
    
    /**
     * 删除文章
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteArticle(@PathVariable Long id) {
        boolean success = articleService.deleteArticle(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
