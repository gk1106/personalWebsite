package com.gk.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * UserDetailsServiceAutoConfiguration is excluded because it otherwise
 * generates and logs a random default-user password on every startup — a
 * mechanism this app doesn't use (our SecurityFilterChain permits all
 * requests and has no login flow) and don't want a fake login backed by it.
 * Real auth (JWT) is a later phase.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class PortfolioBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioBackendApplication.class, args);
    }
}
