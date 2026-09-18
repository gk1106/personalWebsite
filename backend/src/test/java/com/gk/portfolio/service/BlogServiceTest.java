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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlogServiceTest {

    @Mock
    private BlogPostRepository repository;

    private BlogService service;

    private BlogPost samplePost() {
        BlogPost post = new BlogPost();
        post.setId(1L);
        post.setTitle("A Post");
        post.setSlug("a-post");
        post.setExcerpt("excerpt");
        post.setCategory("engineering");
        post.setContentMarkdown("# body");
        post.setStatus(BlogPostStatus.PUBLISHED);
        post.setFeatured(true);
        post.setReadingTime(5);
        post.setPublishedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return post;
    }

    @Test
    void getPublishedPosts_mapsEntitiesToResponseDtos() {
        service = new BlogService(repository);
        BlogPost post = samplePost();
        Pageable pageable = PageRequest.of(0, 10);
        Page<BlogPost> page = new PageImpl<>(List.of(post), pageable, 1);
        when(repository.findByStatusOrderByPublishedAtDescIdDesc(eq(BlogPostStatus.PUBLISHED), any()))
                .thenReturn(page);

        PageResponse<BlogPostResponse> result = service.getPublishedPosts(0, 10);

        assertThat(result.content()).hasSize(1);
        BlogPostResponse dto = result.content().get(0);
        assertThat(dto.getSlug()).isEqualTo("a-post");
        assertThat(dto.getTitle()).isEqualTo("A Post");
        assertThat(dto.isFeatured()).isTrue();
        assertThat(result.page()).isZero();
        assertThat(result.totalElements()).isEqualTo(1);
        verify(repository).findByStatusOrderByPublishedAtDescIdDesc(eq(BlogPostStatus.PUBLISHED), any());
    }

    @Test
    void getPublishedPostBySlug_returnsMappedDto_whenFound() {
        service = new BlogService(repository);
        when(repository.findBySlugAndStatus("a-post", BlogPostStatus.PUBLISHED))
                .thenReturn(Optional.of(samplePost()));

        BlogPostResponse dto = service.getPublishedPostBySlug("a-post");

        assertThat(dto.getSlug()).isEqualTo("a-post");
        assertThat(dto.getContentMarkdown()).isEqualTo("# body");
    }

    @Test
    void getPublishedPostBySlug_throwsNotFound_whenMissingOrDraft() {
        service = new BlogService(repository);
        when(repository.findBySlugAndStatus("missing", BlogPostStatus.PUBLISHED))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublishedPostBySlug("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private BlogPostCreateRequest createRequest(String slug, BlogPostStatus status) {
        return new BlogPostCreateRequest("Title", slug, "excerpt", "engineering", "# body", false, 5, status);
    }

    @Test
    void createPost_withDraftStatus_leavesPublishedAtNull() {
        service = new BlogService(repository);
        when(repository.existsBySlug("new-draft")).thenReturn(false);
        when(repository.save(any(BlogPost.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminBlogPostResponse dto = service.createPost(createRequest("new-draft", BlogPostStatus.DRAFT));

        assertThat(dto.getStatus()).isEqualTo(BlogPostStatus.DRAFT);
        assertThat(dto.getPublishedAt()).isNull();
    }

    @Test
    void createPost_withPublishedStatus_setsPublishedAt() {
        service = new BlogService(repository);
        when(repository.existsBySlug("new-published")).thenReturn(false);
        when(repository.save(any(BlogPost.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminBlogPostResponse dto = service.createPost(createRequest("new-published", BlogPostStatus.PUBLISHED));

        assertThat(dto.getStatus()).isEqualTo(BlogPostStatus.PUBLISHED);
        assertThat(dto.getPublishedAt()).isNotNull();
    }

    @Test
    void createPost_withDuplicateSlug_throwsAndNeverSaves() {
        service = new BlogService(repository);
        when(repository.existsBySlug("taken")).thenReturn(true);

        assertThatThrownBy(() -> service.createPost(createRequest("taken", BlogPostStatus.DRAFT)))
                .isInstanceOf(DuplicateSlugException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void updatePost_withSlugTakenBySomeoneElse_throwsDuplicateSlug() {
        service = new BlogService(repository);
        when(repository.findById(1L)).thenReturn(Optional.of(samplePost()));
        when(repository.existsBySlugAndIdNot("a-post", 1L)).thenReturn(true);

        BlogPostUpdateRequest request = new BlogPostUpdateRequest(
                "Title", "a-post", "excerpt", "engineering", "# body", false, 5, BlogPostStatus.DRAFT);

        assertThatThrownBy(() -> service.updatePost(1L, request))
                .isInstanceOf(DuplicateSlugException.class);
    }

    @Test
    void publishPost_setsPublishedAt_whenNotAlreadyPublished() {
        service = new BlogService(repository);
        BlogPost draft = samplePost();
        draft.setStatus(BlogPostStatus.DRAFT);
        draft.setPublishedAt(null);
        when(repository.findById(1L)).thenReturn(Optional.of(draft));

        AdminBlogPostResponse dto = service.publishPost(1L);

        assertThat(dto.getStatus()).isEqualTo(BlogPostStatus.PUBLISHED);
        assertThat(dto.getPublishedAt()).isNotNull();
    }

    @Test
    void publishPost_doesNotResetPublishedAt_whenAlreadyPublished() {
        service = new BlogService(repository);
        Instant originalPublishedAt = Instant.parse("2020-01-01T00:00:00Z");
        BlogPost alreadyPublished = samplePost();
        alreadyPublished.setStatus(BlogPostStatus.PUBLISHED);
        alreadyPublished.setPublishedAt(originalPublishedAt);
        when(repository.findById(1L)).thenReturn(Optional.of(alreadyPublished));

        AdminBlogPostResponse dto = service.publishPost(1L);

        assertThat(dto.getPublishedAt()).isEqualTo(originalPublishedAt);
    }

    @Test
    void unpublishPost_preservesPublishedAt() {
        service = new BlogService(repository);
        Instant originalPublishedAt = Instant.parse("2020-01-01T00:00:00Z");
        BlogPost published = samplePost();
        published.setStatus(BlogPostStatus.PUBLISHED);
        published.setPublishedAt(originalPublishedAt);
        when(repository.findById(1L)).thenReturn(Optional.of(published));

        AdminBlogPostResponse dto = service.unpublishPost(1L);

        assertThat(dto.getStatus()).isEqualTo(BlogPostStatus.DRAFT);
        assertThat(dto.getPublishedAt()).isEqualTo(originalPublishedAt);
    }

    @Test
    void deletePost_throwsNotFound_whenMissing() {
        service = new BlogService(repository);
        when(repository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.deletePost(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
