package com.gk.portfolio.repository;

import com.gk.portfolio.entity.BlogPost;
import com.gk.portfolio.entity.BlogPostStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Runs against the real local PostgreSQL instance configured via the "dev"
 * profile (see application-dev.yml / README) — Replace.NONE stops Spring
 * from swapping in an embedded database. Each test is transactional and
 * rolled back automatically, so no data is left behind.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("dev")
class BlogPostRepositoryTest {

    @Autowired
    private BlogPostRepository repository;

    private BlogPost newPost(String slug, BlogPostStatus status, Instant publishedAt) {
        BlogPost post = new BlogPost();
        post.setTitle("Title for " + slug);
        post.setSlug(slug);
        post.setExcerpt("excerpt");
        post.setCategory("engineering");
        post.setContentMarkdown("# content");
        post.setStatus(status);
        post.setPublishedAt(publishedAt);
        return post;
    }

    @Test
    void findByStatus_excludesDraftsAndOrdersNewestFirst() {
        Instant now = Instant.now();
        repository.save(newPost("older-published", BlogPostStatus.PUBLISHED, now.minus(2, ChronoUnit.DAYS)));
        repository.save(newPost("newer-published", BlogPostStatus.PUBLISHED, now.minus(1, ChronoUnit.DAYS)));
        repository.save(newPost("a-draft", BlogPostStatus.DRAFT, now));

        Page<BlogPost> page = repository.findByStatusOrderByPublishedAtDescIdDesc(
                BlogPostStatus.PUBLISHED, PageRequest.of(0, 10));

        assertThat(page.getContent()).extracting(BlogPost::getSlug)
                .containsExactly("newer-published", "older-published");
        assertThat(page.getContent()).noneMatch(p -> p.getStatus() == BlogPostStatus.DRAFT);
    }

    @Test
    void findByStatus_respectsPageSize() {
        Instant now = Instant.now();
        for (int i = 0; i < 5; i++) {
            repository.save(newPost("post-" + i, BlogPostStatus.PUBLISHED, now.minusSeconds(i)));
        }

        Page<BlogPost> page = repository.findByStatusOrderByPublishedAtDescIdDesc(
                BlogPostStatus.PUBLISHED, PageRequest.of(0, 2));

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void findBySlugAndStatus_returnsOnlyWhenStatusMatches() {
        repository.save(newPost("published-slug", BlogPostStatus.PUBLISHED, Instant.now()));
        repository.save(newPost("draft-slug", BlogPostStatus.DRAFT, null));

        Optional<BlogPost> published = repository.findBySlugAndStatus("published-slug", BlogPostStatus.PUBLISHED);
        Optional<BlogPost> draftLookedUpAsPublished = repository.findBySlugAndStatus("draft-slug", BlogPostStatus.PUBLISHED);
        Optional<BlogPost> unknown = repository.findBySlugAndStatus("does-not-exist", BlogPostStatus.PUBLISHED);

        assertThat(published).isPresent();
        assertThat(draftLookedUpAsPublished).isEmpty();
        assertThat(unknown).isEmpty();
    }
}
