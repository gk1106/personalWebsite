package com.gk.portfolio.service;

import com.gk.portfolio.dto.ChatRequest;
import com.gk.portfolio.dto.ChatResponse;
import com.gk.portfolio.exception.ChatAssistantException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

/**
 * Thin wrapper around the portfolio ChatClient (see ChatClientConfig for the
 * system prompt / tools it carries). Any failure from the AI layer is caught
 * here and re-thrown as a ChatAssistantException — GlobalExceptionHandler
 * maps that to a generic, safe response; the real exception is only logged,
 * never returned to the caller.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatClient portfolioChatClient;

    public ChatService(ChatClient portfolioChatClient) {
        this.portfolioChatClient = portfolioChatClient;
    }

    public ChatResponse answer(ChatRequest request) {
        try {
            String content = portfolioChatClient.prompt()
                    .user(request.message())
                    .call()
                    .content();
            return new ChatResponse(content);
        } catch (RuntimeException ex) {
            // Never log the user's raw message — it's arbitrary user input and
            // logging it in full isn't necessary to diagnose an AI-layer failure.
            log.warn("Portfolio chat assistant failed to produce a response", ex);
            throw new ChatAssistantException("Portfolio assistant unavailable", ex);
        }
    }
}
