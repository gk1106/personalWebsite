package com.gk.portfolio.controller;

import com.gk.portfolio.dto.AdminBlogPostResponse;
import com.gk.portfolio.dto.BlogPostCreateRequest;
import com.gk.portfolio.dto.BlogPostUpdateRequest;
import com.gk.portfolio.dto.PageResponse;
import com.gk.portfolio.service.BlogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only blog management — every endpoint here requires an authenticated
 * ADMIN JWT (enforced by SecurityConfig, not by anything in this class).
 */
@RestController
@RequestMapping("/api/admin/blog")
@Validated
public class AdminBlogController {

    private static final int MAX_PAGE_SIZE = 50;

    private final BlogService blogService;

    public AdminBlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public PageResponse<AdminBlogPostResponse> list(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(MAX_PAGE_SIZE) int size) {
        return blogService.getAllPostsForAdmin(page, size);
    }

    @GetMapping("/{id}")
    public AdminBlogPostResponse getById(@PathVariable Long id) {
        return blogService.getPostForAdmin(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminBlogPostResponse create(@Valid @RequestBody BlogPostCreateRequest request) {
        return blogService.createPost(request);
    }

    @PutMapping("/{id}")
    public AdminBlogPostResponse update(@PathVariable Long id, @Valid @RequestBody BlogPostUpdateRequest request) {
        return blogService.updatePost(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    public AdminBlogPostResponse publish(@PathVariable Long id) {
        return blogService.publishPost(id);
    }

    @PatchMapping("/{id}/draft")
    public AdminBlogPostResponse draft(@PathVariable Long id) {
        return blogService.unpublishPost(id);
    }
}
