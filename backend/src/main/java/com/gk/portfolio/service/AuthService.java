package com.gk.portfolio.service;

import com.gk.portfolio.dto.LoginRequest;
import com.gk.portfolio.dto.LoginResponse;
import com.gk.portfolio.entity.AdminUser;
import com.gk.portfolio.exception.InvalidCredentialsException;
import com.gk.portfolio.repository.AdminUserRepository;
import com.gk.portfolio.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        // Same exception for "no such username" and "wrong password" — a 401
        // must never reveal which one it was.
        AdminUser admin = adminUserRepository.findByUsername(request.username())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateToken(admin.getUsername(), admin.getRole());
        return new LoginResponse(accessToken, "Bearer", jwtService.getExpirationSeconds());
    }
}
