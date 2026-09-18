package com.gk.portfolio.service;

import com.gk.portfolio.dto.AdminBlogPostResponse;
import com.gk.portfolio.dto.BlogPostCreateRequest;
import com.gk.portfolio.dto.BlogPostResponse;
import com.gk.portfolio.dto.BlogPostUpdateRequest;
import com.gk.portfolio.dto.PageResponse;
import com.gk.portfolio.entity.BlogPost;
import com.gk.portfolio.entity.BlogPostStatus;
import com.gk.portfolio.exception.DuplicateSlugException;
import com.gk.portfolio.exception.ResourceNotFoundException;
import com.gk.portfolio.repository.BlogPostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Public read rules AND admin CRUD/publication rules both live here — not in
 * controllers.
 *
 * Publication model (deliberately simple, documented once):
 * - Creating/updating with status=PUBLISHED sets publishedAt to now(), but
 *   only if it isn't already set — editing an already-published post never
 *   resets its original publish time.
 * - Moving a post to DRAFT (via update, or the dedicated /draft endpoint)
 *   never clears publishedAt — it's preserved as the historical record of
 *   when the post was first published, in case it's republished later.
 * - Creating/updating with status=DRAFT and no prior publishedAt leaves it
 *   null — a post that's never been published has no publish time.
 */
@Service
public class BlogService {

    private final BlogPostRepository blogPostRepository;

    public BlogService(BlogPostRepository blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    // ---- Public read API ----------------------------------------------

    public PageResponse<BlogPostResponse> getPublishedPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BlogPost> published = blogPostRepository
                .findByStatusOrderByPublishedAtDescIdDesc(BlogPostStatus.PUBLISHED, pageable);
        return PageResponse.of(published.map(this::toResponse));
    }

    public BlogPostResponse getPublishedPostBySlug(String slug) {
        BlogPost post = blogPostRepository
                .findBySlugAndStatus(slug, BlogPostStatus.PUBLISHED)
                // Same message whether the slug is unknown or belongs to a draft —
                // callers must not be able to distinguish "doesn't exist" from "is a draft".
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found: " + slug));
        return toResponse(post);
    }

    // ---- Admin API -------------------------------------------------------

    public PageResponse<AdminBlogPostResponse> getAllPostsForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BlogPost> all = blogPostRepository.findAllByOrderByUpdatedAtDescIdDesc(pageable);
        return PageResponse.of(all.map(this::toAdminResponse));
    }

    public AdminBlogPostResponse getPostForAdmin(Long id) {
        return toAdminResponse(findByIdOrThrow(id));
    }

    @Transactional
    public AdminBlogPostResponse createPost(BlogPostCreateRequest request) {
        if (blogPostRepository.existsBySlug(request.slug())) {
            throw new DuplicateSlugException(request.slug());
        }

        BlogPost post = new BlogPost();
        applyEditableFields(post, request.title(), request.slug(), request.excerpt(), request.category(),
                request.contentMarkdown(), request.featured(), request.readingTime());
        applyStatus(post, request.status());

        return toAdminResponse(blogPostRepository.save(post));
    }

    @Transactional
    public AdminBlogPostResponse updatePost(Long id, BlogPostUpdateRequest request) {
        BlogPost post = findByIdOrThrow(id);

        if (blogPostRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new DuplicateSlugException(request.slug());
        }

        applyEditableFields(post, request.title(), request.slug(), request.excerpt(), request.category(),
                request.contentMarkdown(), request.featured(), request.readingTime());
        applyStatus(post, request.status());

        return toAdminResponse(post);
    }

    @Transactional
    public void deletePost(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("Blog post not found: " + id);
        }
        blogPostRepository.deleteById(id);
    }

    @Transactional
    public AdminBlogPostResponse publishPost(Long id) {
        BlogPost post = findByIdOrThrow(id);
        post.setStatus(BlogPostStatus.PUBLISHED);
        if (post.getPublishedAt() == null) {
            post.setPublishedAt(Instant.now());
        }
        return toAdminResponse(post);
    }

    @Transactional
    public AdminBlogPostResponse unpublishPost(Long id) {
        BlogPost post = findByIdOrThrow(id);
        post.setStatus(BlogPostStatus.DRAFT);
        // publishedAt is intentionally left untouched — see class javadoc.
        return toAdminResponse(post);
    }

    // ---- Shared helpers ----------------------------------------------------

    private BlogPost findByIdOrThrow(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found: " + id));
    }

    private void applyEditableFields(BlogPost post, String title, String slug, String excerpt, String category,
                                      String contentMarkdown, boolean featured, Integer readingTime) {
        post.setTitle(title);
        post.setSlug(slug);
        post.setExcerpt(excerpt);
        post.setCategory(category);
        post.setContentMarkdown(contentMarkdown);
        post.setFeatured(featured);
        post.setReadingTime(readingTime);
    }

    private void applyStatus(BlogPost post, BlogPostStatus status) {
        post.setStatus(status);
        if (status == BlogPostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(Instant.now());
        }
    }

    private BlogPostResponse toResponse(BlogPost post) {
        return BlogPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .excerpt(post.getExcerpt())
                .category(post.getCategory())
                .contentMarkdown(post.getContentMarkdown())
                .featured(post.isFeatured())
                .readingTime(post.getReadingTime())
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private AdminBlogPostResponse toAdminResponse(BlogPost post) {
        return AdminBlogPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .excerpt(post.getExcerpt())
                .category(post.getCategory())
                .contentMarkdown(post.getContentMarkdown())
                .status(post.getStatus())
                .featured(post.isFeatured())
                .readingTime(post.getReadingTime())
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
