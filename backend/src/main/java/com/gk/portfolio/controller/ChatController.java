package com.gk.portfolio.controller;

import com.gk.portfolio.dto.ChatRequest;
import com.gk.portfolio.dto.ChatResponse;
import com.gk.portfolio.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public, unauthenticated portfolio chat endpoint. No AI logic lives here — see ChatService. */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.answer(request);
    }
}
