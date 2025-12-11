package com.admin.controller;

import com.admin.annotation.RequiresPermission;
import com.admin.dto.ApiResponse;
import com.admin.entity.Article;
import com.admin.service.ArticleService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文章控制器
 */
@RestController
@RequestMapping("/api/articles")
@Tag(name = "文章管理", description = "文章的增删改查接口")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    /**
     * 分页查询文章列表
     */
    @RequiresPermission("article:list")
    @GetMapping
    @Operation(summary = "获取文章列表", description = "分页查询文章列表，page<=0时返回所有")
    public ApiResponse<List<Article>> getArticles(
            @Parameter(description = "页码，<=0时不分页") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") int size) {
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
    @RequiresPermission("article:list")
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取文章", description = "根据文章ID获取文章详细内容")
    public ApiResponse<Article> getArticleById(
            @Parameter(description = "文章ID") @PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        return ApiResponse.success(article);
    }

    /**
     * 保存文章
     */
    @RequiresPermission("article:add")
    @PostMapping
    @Operation(summary = "保存文章", description = "新增或更新文章")
    public ApiResponse<Void> saveArticle(@RequestBody Article article) {
        boolean success = articleService.saveArticle(article);
        return success ? ApiResponse.success() : ApiResponse.error("保存失败");
    }

    /**
     * 删除文章
     */
    @RequiresPermission("article:delete")
    @DeleteMapping("/{id}")
    @Operation(summary = "删除文章", description = "根据ID删除文章")
    public ApiResponse<Void> deleteArticle(
            @Parameter(description = "文章ID") @PathVariable Long id) {
        boolean success = articleService.deleteArticle(id);
        return success ? ApiResponse.success() : ApiResponse.error("删除失败");
    }
}
