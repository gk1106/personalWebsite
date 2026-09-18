package com.gk.portfolio.config;

import com.gk.portfolio.entity.AdminRole;
import com.gk.portfolio.entity.AdminUser;
import com.gk.portfolio.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * One-time bootstrap for the first admin account, driven entirely by
 * ADMIN_USERNAME / ADMIN_PASSWORD. There is no "create admin" endpoint —
 * this is the only way an admin account comes into existence.
 *
 * Rules, all deliberate:
 * - Both variables are optional; if neither is set, this is a silent no-op
 *   (bootstrap is opt-in, not automatic).
 * - If exactly one is set, startup fails fast — a half-configured bootstrap
 *   is almost certainly a mistake, in dev or prod alike.
 * - If an account for that username already exists, nothing happens — this
 *   never overwrites an existing password, even if ADMIN_PASSWORD changed.
 * - The plaintext password is used exactly once, to compute a BCrypt hash,
 *   and is never logged or persisted anywhere.
 */
@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapUsername;
    private final String bootstrapPassword;

    public AdminBootstrapRunner(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin-bootstrap.username:}") String bootstrapUsername,
            @Value("${app.admin-bootstrap.password:}") String bootstrapPassword) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapUsername = bootstrapUsername;
        this.bootstrapPassword = bootstrapPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean usernameSet = !bootstrapUsername.isBlank();
        boolean passwordSet = !bootstrapPassword.isBlank();

        if (!usernameSet && !passwordSet) {
            log.debug("Admin bootstrap skipped: ADMIN_USERNAME/ADMIN_PASSWORD not set.");
            return;
        }

        if (usernameSet != passwordSet) {
            throw new IllegalStateException(
                    "Both ADMIN_USERNAME and ADMIN_PASSWORD must be set together to bootstrap an admin account (only one was provided).");
        }

        if (adminUserRepository.existsByUsername(bootstrapUsername)) {
            log.info("Admin bootstrap skipped: an account already exists for the configured username.");
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername(bootstrapUsername);
        admin.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
        admin.setRole(AdminRole.ADMIN);
        adminUserRepository.save(admin);

        log.info("Bootstrapped initial admin account '{}'.", bootstrapUsername);
    }
}
