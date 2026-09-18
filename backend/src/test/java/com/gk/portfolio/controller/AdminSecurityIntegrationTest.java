package com.gk.portfolio.controller;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gk.portfolio.dto.LoginResponse;
import com.gk.portfolio.entity.AdminRole;
import com.gk.portfolio.entity.AdminUser;
import com.gk.portfolio.repository.AdminUserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security-focused checks against the real JWT filter chain and real
 * PostgreSQL-backed admin account — no mocking of Spring Security itself.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminSecurityIntegrationTest {

    private static final String USERNAME = "security-test-admin";
    private static final String PASSWORD = "correct-horse-battery-staple";
    private static final String ADMIN_ENDPOINT = "/api/admin/blog";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private String validAdminToken;

    @BeforeEach
    void setUp() throws Exception {
        AdminUser admin = new AdminUser();
        admin.setUsername(USERNAME);
        admin.setPasswordHash(passwordEncoder.encode(PASSWORD));
        admin.setRole(AdminRole.ADMIN);
        adminUserRepository.saveAndFlush(admin);

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + USERNAME + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        validAdminToken = objectMapper.readValue(body, LoginResponse.class).accessToken();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private String tokenWithRole(String role, Instant issuedAt, Instant expiry) {
        return Jwts.builder()
                .subject(USERNAME)
                .claim("role", role)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiry))
                .signWith(signingKey())
                .compact();
    }

    @Test
    void protectedEndpoint_withoutToken_returns401() throws Exception {
        mockMvc.perform(get(ADMIN_ENDPOINT))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withMalformedToken_returns401() throws Exception {
        mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer this-is-not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withTokenSignedByDifferentKey_returns401() throws Exception {
        SecretKey otherKey = Keys.hmacShaKeyFor(
                "a-totally-different-secret-that-is-also-long-enough".getBytes(StandardCharsets.UTF_8));
        String forged = Jwts.builder()
                .subject(USERNAME)
                .claim("role", "ADMIN")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(otherKey)
                .compact();

        mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer " + forged))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withExpiredToken_returns401() throws Exception {
        Instant past = Instant.now().minusSeconds(3600);
        String expired = tokenWithRole("ADMIN", past.minusSeconds(60), past);

        mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withValidAdminToken_returns200() throws Exception {
        mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk());
    }

    @Test
    void protectedEndpoint_withNonAdminRole_returns403() throws Exception {
        String nonAdminToken = tokenWithRole("USER", Instant.now(), Instant.now().plusSeconds(3600));

        mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer " + nonAdminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void tokenInQueryParameter_isIgnored_stillReturns401() throws Exception {
        mockMvc.perform(get(ADMIN_ENDPOINT).param("token", validAdminToken).param("access_token", validAdminToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInCookie_isIgnored_stillReturns401() throws Exception {
        mockMvc.perform(get(ADMIN_ENDPOINT).cookie(new Cookie("token", validAdminToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtIsNeverLogged() throws Exception {
        Logger rootLogger = (Logger) LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        rootLogger.addAppender(appender);

        try {
            String garbageToken = "garbage-token-that-should-never-appear-in-logs";
            mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer " + validAdminToken))
                    .andExpect(status().isOk());
            mockMvc.perform(get(ADMIN_ENDPOINT).header("Authorization", "Bearer " + garbageToken))
                    .andExpect(status().isUnauthorized());

            boolean leaked = appender.list.stream()
                    .map(ILoggingEvent::getFormattedMessage)
                    .anyMatch(msg -> msg.contains(validAdminToken) || msg.contains(garbageToken));
            assertThat(leaked).isFalse();
        } finally {
            rootLogger.detachAppender(appender);
        }
    }
}
