package com.gk.portfolio;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Full context load: starting this successfully means the Spring context
 * wired correctly, Flyway connected to PostgreSQL and ran V1 migration, and
 * Hibernate validated the BlogPost entity against the resulting schema.
 * Requires a real PostgreSQL instance reachable via DB_URL/DB_USERNAME/
 * DB_PASSWORD (or the application-dev.yml local defaults) — see README.
 */
@SpringBootTest
class PortfolioBackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
