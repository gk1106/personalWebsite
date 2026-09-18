package com.gk.portfolio.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

/**
 * Public-facing shape for a blog post. Entities are never returned directly
 * from controllers. `status` is omitted — every post reachable through the
 * public API is implicitly PUBLISHED, so echoing it back is redundant.
 * `tags` isn't included because the current schema (V1 migration) has no
 * tags column yet.
 */
@Getter
@Builder
public class BlogPostResponse {
    private final Long id;
    private final String title;
    private final String slug;
    private final String excerpt;
    private final String category;
    private final String contentMarkdown;
    private final boolean featured;
    private final Integer readingTime;
    private final Instant publishedAt;
    private final Instant createdAt;
    private final Instant updatedAt;
}
