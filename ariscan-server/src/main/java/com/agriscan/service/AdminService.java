package com.agriscan.service;

import com.agriscan.dto.response.AdminStatsDTO;
import com.agriscan.dto.response.AdminUserDTO;
import com.agriscan.entity.Detection;
import com.agriscan.entity.User;
import com.agriscan.repository.DetectionRepository;
import com.agriscan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


 // Admin operations: user management, platform-wide stats.
 
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository      userRepository;
    private final DetectionRepository detectionRepository;

    //  All users with scan summaries 

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::toAdminUserDTO)
            .sorted(Comparator.comparing(AdminUserDTO::getCreatedAt).reversed())
            .toList();
    }

    //  Single user detail 

    public AdminUserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return toAdminUserDTO(user);
    }

    // Change user role

    @Transactional
    public AdminUserDTO changeUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            user.setRole(User.Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Valid values: FARMER, AGRONOMIST, ADMIN");
        }
        return toAdminUserDTO(userRepository.save(user));
    }

    // Delete user

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        // Detections are deleted first (FK constraint)
        detectionRepository.deleteAllByUserId(userId);
        userRepository.deleteById(userId);
    }

    //  Platform-wide stats

    public AdminStatsDTO getPlatformStats() {
        List<User>      allUsers  = userRepository.findAll();
        List<Detection> allScans  = detectionRepository.findAll();

        long totalUsers  = allUsers.size();
        long totalScans  = allScans.size();

        long severeScans = allScans.stream()
            .filter(d -> "Severe".equalsIgnoreCase(d.getSeverity()))
            .count();

        long healthyScans = allScans.stream()
            .filter(d -> "Healthy".equalsIgnoreCase(d.getSeverity()))
            .count();

        double avgHealth = allScans.stream()
            .filter(d -> d.getHealthScore() != null)
            .mapToInt(Detection::getHealthScore)
            .average().orElse(0.0);

        // Top 5 diseases
        Map<String, Long> topDiseases = allScans.stream()
            .filter(d -> d.getDiseaseName() != null
                      && !"Healthy".equalsIgnoreCase(d.getDiseaseName()))
            .collect(Collectors.groupingBy(Detection::getDiseaseName, Collectors.counting()))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .collect(Collectors.toMap(
                Map.Entry::getKey, Map.Entry::getValue,
                (a, b) -> a, java.util.LinkedHashMap::new));

        // Crop breakdown
        Map<String, Long> cropBreakdown = allScans.stream()
            .filter(d -> d.getCropType() != null)
            .collect(Collectors.groupingBy(Detection::getCropType, Collectors.counting()));

        // User growth by month (YYYY-MM)
        Map<String, Long> userGrowth = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null)
            .collect(Collectors.groupingBy(
                u -> u.getCreatedAt().getYear() + "-"
                     + String.format("%02d", u.getCreatedAt().getMonthValue()),
                Collectors.counting()
            ));

        return AdminStatsDTO.builder()
            .totalUsers(totalUsers)
            .totalScans(totalScans)
            .severeScans(severeScans)
            .healthyScans(healthyScans)
            .averageHealthScore(Math.round(avgHealth * 10.0) / 10.0)
            .topDiseases(topDiseases)
            .cropBreakdown(cropBreakdown)
            .userGrowth(userGrowth)
            .build();
    }

    //  All scans for a specific user 

    public List<Detection> getUserScans(Long userId) {
        return detectionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    //  Mapper 

    private AdminUserDTO toAdminUserDTO(User user) {
        List<Detection> scans =
            detectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        long severeCount = scans.stream()
            .filter(d -> "Severe".equalsIgnoreCase(d.getSeverity()))
            .count();

        double avgHealth = scans.stream()
            .filter(d -> d.getHealthScore() != null)
            .mapToInt(Detection::getHealthScore)
            .average().orElse(0.0);

        Detection lastScan = scans.isEmpty() ? null : scans.get(0);

        return AdminUserDTO.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .region(user.getRegion())
            .state(user.getState())
            .farmSize(user.getFarmSize())
            .crops(user.getCrops())
            .language(user.getLanguage())
            .role(user.getRole() != null ? user.getRole().name() : "FARMER")
            .createdAt(user.getCreatedAt())
            .totalScans(scans.size())
            .severeScans((int) severeCount)
            .averageHealthScore(Math.round(avgHealth * 10.0) / 10.0)
            .lastScanDisease(lastScan != null ? lastScan.getDiseaseName() : null)
            .lastScanAt(lastScan != null ? lastScan.getCreatedAt() : null)
            .build();
    }
}