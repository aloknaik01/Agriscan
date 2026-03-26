package com.agriscan.controller;

import com.agriscan.dto.request.UpdateProfileRequest;
import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.UserDTO;
import com.agriscan.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/v1/user/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile() {
        return ResponseEntity.ok(
            ApiResponse.success("Profile fetched", userService.getProfile())
        );
    }

    // PUT /api/v1/user/profile
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Profile updated", userService.updateProfile(request))
        );
    }

    // PUT /api/v1/user/password
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody Map<String, String> body) {
        userService.changePassword(
            body.get("oldPassword"),
            body.get("newPassword")
        );
        return ResponseEntity.ok(
            ApiResponse.success("Password changed", null)
        );
    }
}