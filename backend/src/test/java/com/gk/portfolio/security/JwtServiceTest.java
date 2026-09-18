package com.gk.portfolio.security;

import com.gk.portfolio.entity.AdminRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "test-only-jwt-secret-at-least-32-bytes-long-1234567890";

    private final JwtService jwtService = new JwtService(SECRET, 30);

    @Test
    void generateToken_producesTokenThatValidatesAndRoundTrips() {
        String token = jwtService.generateToken("alice", AdminRole.ADMIN);

        Optional<Claims> claims = jwtService.validateAndParse(token);

        assertThat(claims).isPresent();
        assertThat(jwtService.extractUsername(claims.get())).isEqualTo("alice");
        assertThat(jwtService.extractRole(claims.get())).isEqualTo("ADMIN");
    }

    @Test
    void validateAndParse_returnsEmpty_forMalformedToken() {
        assertThat(jwtService.validateAndParse("not-a-jwt")).isEmpty();
    }

    @Test
    void validateAndParse_returnsEmpty_forTokenSignedWithDifferentSecret() {
        SecretKey otherKey = Keys.hmacShaKeyFor(
                "a-completely-different-secret-that-is-long-enough".getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .subject("alice")
                .claim("role", "ADMIN")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(60)))
                .signWith(otherKey)
                .compact();

        assertThat(jwtService.validateAndParse(token)).isEmpty();
    }

    @Test
    void validateAndParse_returnsEmpty_forExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        Instant past = Instant.now().minusSeconds(120);
        String expired = Jwts.builder()
                .subject("alice")
                .claim("role", "ADMIN")
                .issuedAt(Date.from(past.minusSeconds(60)))
                .expiration(Date.from(past))
                .signWith(key)
                .compact();

        assertThat(jwtService.validateAndParse(expired)).isEmpty();
    }

    @Test
    void getExpirationSeconds_convertsMinutesToSeconds() {
        assertThat(jwtService.getExpirationSeconds()).isEqualTo(30 * 60L);
    }
}
