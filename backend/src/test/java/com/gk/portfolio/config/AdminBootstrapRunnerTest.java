package com.gk.portfolio.config;

import com.gk.portfolio.entity.AdminUser;
import com.gk.portfolio.repository.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapRunnerTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void doesNothing_whenNeitherVariableSet() {
        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminUserRepository, passwordEncoder, "", "");

        runner.run(null);

        verify(adminUserRepository, never()).save(any());
    }

    @Test
    void throws_whenOnlyUsernameSet() {
        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminUserRepository, passwordEncoder, "admin", "");

        assertThatThrownBy(() -> runner.run(null)).isInstanceOf(IllegalStateException.class);
        verify(adminUserRepository, never()).save(any());
    }

    @Test
    void throws_whenOnlyPasswordSet() {
        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminUserRepository, passwordEncoder, "", "secret");

        assertThatThrownBy(() -> runner.run(null)).isInstanceOf(IllegalStateException.class);
        verify(adminUserRepository, never()).save(any());
    }

    @Test
    void skipsCreation_whenUsernameAlreadyExists() {
        when(adminUserRepository.existsByUsername("admin")).thenReturn(true);
        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminUserRepository, passwordEncoder, "admin", "secret");

        runner.run(null);

        verify(adminUserRepository, never()).save(any());
    }

    @Test
    void createsAdmin_withBcryptHashedPassword_whenUsernameDoesNotExist() {
        when(adminUserRepository.existsByUsername("admin")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hashed-secret");
        AdminBootstrapRunner runner = new AdminBootstrapRunner(adminUserRepository, passwordEncoder, "admin", "secret");

        runner.run(null);

        ArgumentCaptor<AdminUser> captor = ArgumentCaptor.forClass(AdminUser.class);
        verify(adminUserRepository).save(captor.capture());
        AdminUser saved = captor.getValue();
        assertThat(saved.getUsername()).isEqualTo("admin");
        assertThat(saved.getPasswordHash()).isEqualTo("hashed-secret");
        assertThat(saved.getPasswordHash()).isNotEqualTo("secret");
    }
}
