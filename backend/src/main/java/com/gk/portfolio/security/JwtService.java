package com.gk.portfolio.security;

import com.gk.portfolio.entity.AdminRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * Sole owner of JWT generation/parsing — no controller or filter touches the
 * JJWT API directly. Access-token-only (no refresh tokens).
 */
@Component
public class JwtService {

    private static final String ROLE_CLAIM = "role";

    private final SecretKey signingKey;
    private final long expirationMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        // HS256 requires a key of at least 256 bits (32 bytes). A short/weak
        // JWT_SECRET fails fast here at startup instead of silently signing
        // tokens with an insecure key.
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }

    public String generateToken(String username, AdminRole role) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(getExpirationSeconds());
        return Jwts.builder()
                .subject(username)
                .claim(ROLE_CLAIM, role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validates signature and expiration together. Returns empty for any
     * failure (missing, malformed, expired, bad signature) — callers must
     * not distinguish between these, and the token itself is never logged.
     */
    public Optional<Claims> validateAndParse(String token) {
        try {
            return Optional.of(Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload());
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public String extractUsername(Claims claims) {
        return claims.getSubject();
    }

    public String extractRole(Claims claims) {
        return claims.get(ROLE_CLAIM, String.class);
    }
}
