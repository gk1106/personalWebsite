package com.gk.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

/**
 * Maps to blog_posts (see db/migration). Timestamps are stored as
 * TIMESTAMP WITH TIME ZONE / java.time.Instant (UTC internally) rather than
 * relying on the JVM's local timezone — see application.yml's
 * hibernate.jdbc.time_zone setting.
 */
@Entity
@Table(name = "blog_posts")
@Getter
@Setter
@NoArgsConstructor
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(length = 500)
    private String excerpt;

    @Column(length = 100)
    private String category;

    // Plain TEXT column, not a Postgres large object (oid) — @Lob on a String
    // maps to CLOB/oid by default in Hibernate 6, which doesn't match the
    // TEXT column Flyway creates. LONGVARCHAR is the correct match for TEXT.
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "content_markdown")
    private String contentMarkdown;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlogPostStatus status = BlogPostStatus.DRAFT;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(name = "reading_time")
    private Integer readingTime;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
