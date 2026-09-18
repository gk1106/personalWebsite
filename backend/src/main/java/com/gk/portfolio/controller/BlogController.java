package com.gk.portfolio.controller;

import com.gk.portfolio.dto.BlogPostResponse;
import com.gk.portfolio.dto.PageResponse;
import com.gk.portfolio.service.BlogService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Public, unauthenticated blog read endpoints. No admin/CRUD here. */
@RestController
@RequestMapping("/api/blog")
@Validated
public class BlogController {

    private static final int MAX_PAGE_SIZE = 50;

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public PageResponse<BlogPostResponse> listPublished(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(MAX_PAGE_SIZE) int size) {
        return blogService.getPublishedPosts(page, size);
    }

    @GetMapping("/{slug}")
    public BlogPostResponse getPublishedBySlug(@PathVariable String slug) {
        return blogService.getPublishedPostBySlug(slug);
    }
}
