package com.gk.portfolio.controller;

import com.gk.portfolio.entity.BlogPost;
import com.gk.portfolio.entity.BlogPostStatus;
import com.gk.portfolio.repository.BlogPostRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack test against the real local PostgreSQL instance (same
 * infrastructure PortfolioBackendApplicationTests already relies on) — not
 * mocked. Wrapped in @Transactional so every row inserted here is rolled
 * back at the end of each test method.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BlogControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BlogPostRepository repository;

    private BlogPost save(String slug, BlogPostStatus status, Instant publishedAt) {
        BlogPost post = new BlogPost();
        post.setTitle("Title " + slug);
        post.setSlug(slug);
        post.setExcerpt("excerpt for " + slug);
        post.setCategory("engineering");
        post.setContentMarkdown("# " + slug);
        post.setStatus(status);
        post.setPublishedAt(publishedAt);
        return repository.saveAndFlush(post);
    }

    @Test
    void listPublished_excludesDrafts_andSortsNewestFirst() throws Exception {
        Instant now = Instant.now();
        save("older", BlogPostStatus.PUBLISHED, now.minus(2, ChronoUnit.DAYS));
        save("newer", BlogPostStatus.PUBLISHED, now.minus(1, ChronoUnit.DAYS));
        save("a-draft", BlogPostStatus.DRAFT, now);

        mockMvc.perform(get("/api/blog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].slug", is("newer")))
                .andExpect(jsonPath("$.content[1].slug", is("older")))
                .andExpect(jsonPath("$.content", org.hamcrest.Matchers.hasSize(2)));
    }

    @Test
    void listPublished_honoursPagination() throws Exception {
        Instant now = Instant.now();
        for (int i = 0; i < 3; i++) {
            save("post-" + i, BlogPostStatus.PUBLISHED, now.minusSeconds(i));
        }

        mockMvc.perform(get("/api/blog").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(2)))
                .andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));
    }

    @Test
    void listPublished_rejectsPageSizeAboveMaximum() throws Exception {
        mockMvc.perform(get("/api/blog").param("size", "51"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listPublished_rejectsNegativePage() throws Exception {
        mockMvc.perform(get("/api/blog").param("page", "-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getBySlug_returnsPublishedPost() throws Exception {
        save("published-post", BlogPostStatus.PUBLISHED, Instant.now());

        mockMvc.perform(get("/api/blog/published-post"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug", is("published-post")))
                .andExpect(jsonPath("$.contentMarkdown", is("# published-post")))
                .andExpect(jsonPath("$.status").doesNotExist());
    }

    @Test
    void getBySlug_returns404_forDraft() throws Exception {
        save("draft-post", BlogPostStatus.DRAFT, null);

        mockMvc.perform(get("/api/blog/draft-post"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getBySlug_returns404_forUnknownSlug() throws Exception {
        mockMvc.perform(get("/api/blog/does-not-exist"))
                .andExpect(status().isNotFound());
    }
}
