package com.agriscan.controller;

import com.agriscan.dto.response.AdminStatsDTO;
import com.agriscan.dto.response.AdminUserDTO;
import com.agriscan.dto.response.ApiResponse;
import com.agriscan.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints.
 * All routes require ROLE_ADMIN (enforced via @PreAuthorize).
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // GET /api/v1/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDTO>> getStats() {
        return ResponseEntity.ok(
            ApiResponse.success("Platform stats fetched", adminService.getPlatformStats()));
    }

    // GET /api/v1/admin/users
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserDTO>>> getAllUsers() {
        return ResponseEntity.ok(
            ApiResponse.success("Users fetched", adminService.getAllUsers()));
    }

    // GET /api/v1/admin/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserDTO>> getUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("User fetched", adminService.getUserById(id)));
    }

    // PUT /api/v1/admin/users/{id}/role
    // Body: { "role": "AGRONOMIST" }
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserDTO>> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (role == null || role.isBlank()) {
            throw new RuntimeException("role field is required");
        }
        return ResponseEntity.ok(
            ApiResponse.success("Role updated", adminService.changeUserRole(id, role)));
    }

    // DELETE /api/v1/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(
            ApiResponse.success("User deleted", null));
    }
}