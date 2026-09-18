package com.gk.portfolio.dto;

/** expiresIn is in seconds, matching the OAuth2-style convention. */
public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
