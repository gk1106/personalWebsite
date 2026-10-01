package com.gk.portfolio.controller;

import com.gk.portfolio.dto.ChatRequest;
import com.gk.portfolio.dto.ChatResponse;
import com.gk.portfolio.exception.ChatAssistantException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gk.portfolio.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ChatService is replaced with a mock — this never calls the real OpenAI
 * API. Only verifies request validation and the controller/exception-handler
 * wiring (public access, 400 on invalid input, 503 with a safe message when
 * the AI layer fails).
 */
@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ChatService chatService;

    @Test
    void chat_returnsAnswer_forValidMessage() throws Exception {
        when(chatService.answer(any(ChatRequest.class)))
                .thenReturn(new ChatResponse("Ganesh has built InsuranceAI Agent, Jansamarth, and InsuranceHub."));

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChatRequest("What projects has Ganesh worked on?"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", is("Ganesh has built InsuranceAI Agent, Jansamarth, and InsuranceHub.")));
    }

    @Test
    void chat_rejectsBlankMessage() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChatRequest("  "))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void chat_rejectsMessageAboveMaxLength() throws Exception {
        String tooLong = "a".repeat(2001);

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChatRequest(tooLong))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void chat_returns503WithSafeMessage_whenAiLayerFails() throws Exception {
        when(chatService.answer(any(ChatRequest.class)))
                .thenThrow(new ChatAssistantException("Portfolio assistant unavailable", new RuntimeException("upstream secret-leaking detail")));

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChatRequest("Tell me about Ganesh"))))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message", is("Sorry, the portfolio assistant is temporarily unavailable. Please try again later.")));
    }
}
