package com.gk.portfolio.dto;

import com.gk.portfolio.entity.BlogPostStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

/** Full editable representation for the admin UI — unlike the public BlogPostResponse, this includes status. */
@Getter
@Builder
public class AdminBlogPostResponse {
    private final Long id;
    private final String title;
    private final String slug;
    private final String excerpt;
    private final String category;
    private final String contentMarkdown;
    private final BlogPostStatus status;
    private final boolean featured;
    private final Integer readingTime;
    private final Instant publishedAt;
    private final Instant createdAt;
    private final Instant updatedAt;
}
