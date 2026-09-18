package com.gk.portfolio.exception;

/** Thrown when a blog post is created/updated with a slug that's already taken. */
public class DuplicateSlugException extends RuntimeException {

    public DuplicateSlugException(String slug) {
        super("A blog post with slug '" + slug + "' already exists");
    }
}
