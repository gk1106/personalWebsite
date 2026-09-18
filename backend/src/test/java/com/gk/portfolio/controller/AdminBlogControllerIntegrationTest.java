package com.gk.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gk.portfolio.dto.LoginResponse;
import com.gk.portfolio.entity.AdminRole;
import com.gk.portfolio.entity.AdminUser;
import com.gk.portfolio.entity.BlogPost;
import com.gk.portfolio.entity.BlogPostStatus;
import com.gk.portfolio.repository.AdminUserRepository;
import com.gk.portfolio.repository.BlogPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full CRUD + publication-workflow coverage against real PostgreSQL, using a
 * real admin JWT obtained through the real /api/auth/login endpoint (not
 * fabricated). Rolled back per test via @Transactional.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminBlogControllerIntegrationTest {

    private static final String USERNAME = "crud-test-admin";
    private static final String PASSWORD = "correct-horse-battery-staple";
    private static final String BASE = "/api/admin/blog";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        AdminUser admin = new AdminUser();
        admin.setUsername(USERNAME);
        admin.setPasswordHash(passwordEncoder.encode(PASSWORD));
        admin.setRole(AdminRole.ADMIN);
        adminUserRepository.saveAndFlush(admin);

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + USERNAME + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        adminToken = objectMapper.readValue(body, LoginResponse.class).accessToken();
    }

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder) {
        return builder.header("Authorization", "Bearer " + adminToken);
    }

    private String createRequestJson(String slug, BlogPostStatus status) {
        return """
                {
                  "title": "Test Post %s",
                  "slug": "%s",
                  "excerpt": "an excerpt",
                  "category": "engineering",
                  "contentMarkdown": "# body",
                  "featured": false,
                  "readingTime": 5,
                  "status": "%s"
                }
                """.formatted(slug, slug, status);
    }

    @Test
    void adminCanCreateDraftPost() throws Exception {
        mockMvc.perform(authed(post(BASE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequestJson("crud-create-draft", BlogPostStatus.DRAFT)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.publishedAt").doesNotExist());
    }

    @Test
    void adminCanCreatePublishedPost() throws Exception {
        mockMvc.perform(authed(post(BASE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequestJson("crud-create-published", BlogPostStatus.PUBLISHED)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PUBLISHED")))
                .andExpect(jsonPath("$.publishedAt").isNotEmpty());
    }

    @Test
    void adminCanUpdatePost() throws Exception {
        BlogPost post = blogPostRepository.saveAndFlush(draftEntity("crud-update-me"));

        String updateJson = """
                {
                  "title": "Updated Title",
                  "slug": "crud-update-me",
                  "excerpt": "updated excerpt",
                  "category": "engineering",
                  "contentMarkdown": "# updated body",
                  "featured": true,
                  "readingTime": 9,
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(authed(put(BASE + "/" + post.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.featured", is(true)))
                .andExpect(jsonPath("$.readingTime", is(9)));
    }

    @Test
    void creatingWithDuplicateSlug_returns409() throws Exception {
        mockMvc.perform(authed(post(BASE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequestJson("crud-duplicate-slug", BlogPostStatus.DRAFT)))
                .andExpect(status().isCreated());

        mockMvc.perform(authed(post(BASE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequestJson("crud-duplicate-slug", BlogPostStatus.PUBLISHED)))
                .andExpect(status().isConflict());
    }

    @Test
    void adminCanPublishADraft_andPublishedAtIsSet() throws Exception {
        BlogPost post = blogPostRepository.saveAndFlush(draftEntity("crud-publish-me"));
        assertThat(post.getPublishedAt()).isNull();

        mockMvc.perform(authed(patch(BASE + "/" + post.getId() + "/publish")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PUBLISHED")))
                .andExpect(jsonPath("$.publishedAt").isNotEmpty());
    }

    @Test
    void adminCanMovePublishedPostBackToDraft_preservingPublishedAt() throws Exception {
        BlogPost post = draftEntity("crud-unpublish-me");
        post.setStatus(BlogPostStatus.PUBLISHED);
        post.setPublishedAt(Instant.parse("2026-01-01T00:00:00Z"));
        post = blogPostRepository.saveAndFlush(post);

        mockMvc.perform(authed(patch(BASE + "/" + post.getId() + "/draft")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.publishedAt", is("2026-01-01T00:00:00Z")));
    }

    @Test
    void adminCanDeletePost_andItThenReturns404() throws Exception {
        BlogPost post = blogPostRepository.saveAndFlush(draftEntity("crud-delete-me"));

        mockMvc.perform(authed(delete(BASE + "/" + post.getId())))
                .andExpect(status().isNoContent());

        mockMvc.perform(authed(get(BASE + "/" + post.getId())))
                .andExpect(status().isNotFound());
    }

    @Test
    void gettingNonexistentPost_returns404() throws Exception {
        mockMvc.perform(authed(get(BASE + "/999999999")))
                .andExpect(status().isNotFound());
    }

    @Test
    void publishingNonexistentPost_returns404() throws Exception {
        mockMvc.perform(authed(patch(BASE + "/999999999/publish")))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminList_includesBothDraftAndPublished_andPaginates() throws Exception {
        blogPostRepository.saveAndFlush(draftEntity("crud-list-draft-1"));
        BlogPost published = draftEntity("crud-list-published-1");
        published.setStatus(BlogPostStatus.PUBLISHED);
        published.setPublishedAt(Instant.now());
        blogPostRepository.saveAndFlush(published);
        blogPostRepository.saveAndFlush(draftEntity("crud-list-draft-2"));

        mockMvc.perform(authed(get(BASE)).param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.size", is(2)))
                .andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));
    }

    @Test
    void adminList_rejectsPageSizeAboveMaximum() throws Exception {
        mockMvc.perform(authed(get(BASE)).param("size", "51"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_rejectsInvalidSlugFormat() throws Exception {
        String invalid = """
                {
                  "title": "Bad Slug Post",
                  "slug": "Building RAG!!!",
                  "excerpt": "excerpt",
                  "category": "engineering",
                  "contentMarkdown": "# body",
                  "featured": false,
                  "readingTime": 5,
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(authed(post(BASE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_rejectsMissingRequiredFields() throws Exception {
        String missingTitle = """
                {
                  "slug": "missing-title-post",
                  "category": "engineering",
                  "contentMarkdown": "# body",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(authed(post(BASE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(missingTitle))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminResponses_neverContainPasswordFields() throws Exception {
        BlogPost post = blogPostRepository.saveAndFlush(draftEntity("crud-response-shape-check"));

        String body = mockMvc.perform(authed(get(BASE + "/" + post.getId())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(body.toLowerCase()).doesNotContain("password");
    }

    private BlogPost draftEntity(String slug) {
        BlogPost post = new BlogPost();
        post.setTitle("Entity " + slug);
        post.setSlug(slug);
        post.setExcerpt("excerpt");
        post.setCategory("engineering");
        post.setContentMarkdown("# content");
        post.setStatus(BlogPostStatus.DRAFT);
        return post;
    }
}
