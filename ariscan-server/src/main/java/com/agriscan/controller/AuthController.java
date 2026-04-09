package com.agriscan.controller;

import com.agriscan.dto.request.LoginRequest;
import com.agriscan.dto.request.RegisterRequest;
import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.AuthResponse;
import com.agriscan.security.JwtService;
import com.agriscan.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService  jwtService;

    // POST /api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Registration successful",
                authService.register(request))
        );
    }

    // POST /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Login successful",
                authService.login(request))
        );
    }

    // POST /api/v1/auth/logout
    // Revokes the current bearer token so it can no longer be used.
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtService.revokeToken(authHeader.substring(7));
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}