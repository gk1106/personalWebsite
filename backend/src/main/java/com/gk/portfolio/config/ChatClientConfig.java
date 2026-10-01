package com.gk.portfolio.config;

import com.gk.portfolio.ai.PortfolioAssistantPrompt;
import com.gk.portfolio.ai.PortfolioTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the one ChatClient the portfolio assistant uses: the centralized
 * system prompt (PortfolioAssistantPrompt) and the curated portfolio tools
 * (PortfolioTools) are attached here as defaults, so every call made through
 * ChatService automatically carries both without repeating them per request.
 */
@Configuration
public class ChatClientConfig {

    @Bean
    public ChatClient portfolioChatClient(ChatClient.Builder chatClientBuilder, PortfolioTools portfolioTools) {
        return chatClientBuilder
                .defaultSystem(PortfolioAssistantPrompt.SYSTEM_PROMPT)
                .defaultTools(portfolioTools)
                .build();
    }
}
