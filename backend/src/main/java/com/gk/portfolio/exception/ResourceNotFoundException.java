package com.gk.portfolio.exception;

/** Thrown when a requested resource (e.g. a blog post by slug) doesn't exist. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
