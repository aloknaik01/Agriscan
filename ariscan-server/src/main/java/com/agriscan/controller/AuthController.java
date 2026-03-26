package com.agriscan.controller;

import com.agriscan.dto.request.LoginRequest;
import com.agriscan.dto.request.RegisterRequest;
import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.AuthResponse;
import com.agriscan.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(
            ApiResponse.success("Registration successful", response)
        );
    }

    // login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
            ApiResponse.success("Login successful", response)
        );
    }
}