package com.gk.portfolio.dto;

import com.gk.portfolio.entity.BlogPostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * id/createdAt/updatedAt are deliberately absent — the client never controls
 * them. publishedAt isn't here either: it's derived from `status` by
 * BlogService, not supplied directly.
 */
public record BlogPostCreateRequest(
        @NotBlank(message = "title is required") @Size(max = 255, message = "title must be at most 255 characters") String title,

        @NotBlank(message = "slug is required")
        @Size(max = 255, message = "slug must be at most 255 characters")
        @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "slug must be lowercase letters, numbers, and hyphens only (e.g. building-rag-with-spring-boot)")
        String slug,

        @Size(max = 500, message = "excerpt must be at most 500 characters") String excerpt,

        @NotBlank(message = "category is required") @Size(max = 100, message = "category must be at most 100 characters") String category,

        @NotBlank(message = "contentMarkdown is required") String contentMarkdown,

        boolean featured,

        @Positive(message = "readingTime must be positive") Integer readingTime,

        @NotNull(message = "status is required") BlogPostStatus status
) {
}
