package com.gk.portfolio.exception;

/** Thrown when the Spring AI / OpenAI chat layer fails or is unreachable. */
public class ChatAssistantException extends RuntimeException {

    public ChatAssistantException(String message, Throwable cause) {
        super(message, cause);
    }
}
