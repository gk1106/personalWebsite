package com.gk.portfolio.service;

import com.gk.portfolio.dto.ChatRequest;
import com.gk.portfolio.dto.ChatResponse;
import com.gk.portfolio.exception.ChatAssistantException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Pure unit test — the ChatClient is mocked, so this never calls the real
 * OpenAI API. Only verifies ChatService's own plumbing: passing the user
 * message through, and translating any AI-layer failure into a
 * ChatAssistantException rather than letting a raw exception escape.
 */
@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatClient chatClient;

    @Mock
    private ChatClient.ChatClientRequestSpec requestSpec;

    @Mock
    private ChatClient.CallResponseSpec callResponseSpec;

    @Test
    void answer_returnsChatClientContent_forValidMessage() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user("Tell me about your experience")).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn("Ganesh works across the stack...");

        ChatService service = new ChatService(chatClient);
        ChatResponse response = service.answer(new ChatRequest("Tell me about your experience"));

        assertThat(response.answer()).isEqualTo("Ganesh works across the stack...");
    }

    @Test
    void answer_wrapsAiLayerFailure_asChatAssistantException() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user("What is the weather?")).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("upstream OpenAI 500"));

        ChatService service = new ChatService(chatClient);

        assertThatThrownBy(() -> service.answer(new ChatRequest("What is the weather?")))
                .isInstanceOf(ChatAssistantException.class)
                .hasMessageNotContaining("upstream OpenAI 500");
    }
}
