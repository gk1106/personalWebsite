package com.gk.portfolio.repository;

import com.gk.portfolio.entity.BlogPost;
import com.gk.portfolio.entity.BlogPostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlug(String slug);

    /**
     * The publication rule is enforced here, at the query level, so callers
     * (and future callers) can never accidentally fetch drafts by forgetting
     * to filter in Java.
     */
    Page<BlogPost> findByStatusOrderByPublishedAtDescIdDesc(BlogPostStatus status, Pageable pageable);

    Optional<BlogPost> findBySlugAndStatus(String slug, BlogPostStatus status);

    /** Admin list: both DRAFT and PUBLISHED, newest edited first. */
    Page<BlogPost> findAllByOrderByUpdatedAtDescIdDesc(Pageable pageable);

    boolean existsBySlug(String slug);

    /** Slug uniqueness check on update — excludes the post being updated itself. */
    boolean existsBySlugAndIdNot(String slug, Long id);
}
