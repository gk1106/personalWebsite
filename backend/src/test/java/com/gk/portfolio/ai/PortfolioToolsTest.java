package com.gk.portfolio.ai;

import com.gk.portfolio.dto.BlogPostResponse;
import com.gk.portfolio.dto.PageResponse;
import com.gk.portfolio.service.BlogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Pure data test — no Spring context, no network. These tools never call an
 * LLM themselves; they only return the curated portfolio facts the model is
 * allowed to use. BlogService is mocked so this never touches a real
 * database.
 */
@ExtendWith(MockitoExtension.class)
class PortfolioToolsTest {

    @Mock
    private BlogService blogService;

    @Test
    void getProjects_listsAllKnownProjects() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getProjects();

        assertThat(result).contains("InsuranceAI Agent", "Jansamarth", "InsuranceHub");
    }

    @Test
    void getProject_returnsMatchingProjectDetail_byTitle() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getProject("InsuranceAI Agent");

        assertThat(result).contains("InsuranceAI Agent");
        assertThat(result).contains("Problem:");
        assertThat(result).contains("RAG");
    }

    @Test
    void getProject_matchesCaseInsensitivelyBySlug() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getProject("insurancehub");

        assertThat(result).contains("InsuranceHub");
    }

    @Test
    void getProject_returnsNotFoundMessage_forUnknownProject() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getProject("Some Unrelated Project");

        assertThat(result).contains("No project named").contains("Some Unrelated Project");
    }

    @Test
    void getSkills_containsCoreTechnologies() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getSkills();

        assertThat(result).contains("Java", "Spring Boot", "React", "AWS", "RAG");
    }

    @Test
    void getEducation_containsDegrees() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getEducation();

        assertThat(result).contains("B.Sc Computer Science").contains("MCA");
    }

    @Test
    void getProfile_containsContactLinks() {
        PortfolioTools tools = new PortfolioTools(blogService);

        String result = tools.getProfile();

        assertThat(result).contains("ganeshkumar.v.dev@gmail.com", "github.com/gk1106", "linkedin.com/in/gk1106");
    }

    @Test
    void getBlogPosts_formatsPublishedPosts() {
        BlogPostResponse post = BlogPostResponse.builder()
                .id(1L)
                .title("Building an AI Agent")
                .slug("building-an-ai-agent")
                .excerpt("How I built a tool-calling agent.")
                .build();
        when(blogService.getPublishedPosts(0, 20)).thenReturn(new PageResponse<>(List.of(post), 0, 20, 1, 1));

        PortfolioTools tools = new PortfolioTools(blogService);
        String result = tools.getBlogPosts();

        assertThat(result).contains("Building an AI Agent", "How I built a tool-calling agent.");
    }

    @Test
    void getBlogPosts_returnsNoPostsMessage_whenNonePublished() {
        when(blogService.getPublishedPosts(0, 20)).thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

        PortfolioTools tools = new PortfolioTools(blogService);
        String result = tools.getBlogPosts();

        assertThat(result).isEqualTo("No blog posts are currently published.");
    }
}
