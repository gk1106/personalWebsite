CREATE TABLE blog_posts (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL,
    excerpt           VARCHAR(500),
    category          VARCHAR(100),
    content_markdown  TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    featured          BOOLEAN NOT NULL DEFAULT FALSE,
    reading_time      INTEGER,
    published_at      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT chk_blog_posts_status CHECK (status IN ('DRAFT', 'PUBLISHED'))
);

CREATE UNIQUE INDEX uq_blog_posts_slug ON blog_posts (slug);
CREATE INDEX idx_blog_posts_status ON blog_posts (status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts (published_at);
