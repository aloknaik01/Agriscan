package com.agriscan.service;

import com.agriscan.dto.request.LoginRequest;
import com.agriscan.dto.request.RegisterRequest;
import com.agriscan.dto.response.AuthResponse;
import com.agriscan.entity.User;
import com.agriscan.repository.UserRepository;
import com.agriscan.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final JwtService       jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .region(request.getRegion())
            .state(request.getState())
            .farmSize(request.getFarmSize())
            .crops(request.getCrops())
            .language(request.getLanguage())
            .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return buildResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return buildResponse(user, token);
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
            .token(token)
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole() != null ? user.getRole().name() : "FARMER")
            .region(user.getRegion())
            .state(user.getState())
            .farmSize(user.getFarmSize())
            .crops(user.getCrops())
            .language(user.getLanguage())
            .build();
    }
}