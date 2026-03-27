package com.agriscan.service;

import com.agriscan.dto.response.AnalyticsDTO;
import com.agriscan.entity.Detection;
import com.agriscan.entity.User;
import com.agriscan.repository.DetectionRepository;
import com.agriscan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DetectionRepository detectionRepository;
    private final UserRepository      userRepository;

    public AnalyticsDTO getAnalytics() {
        User user = getLoggedInUser();
        List<Detection> scans =
            detectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        if (scans.isEmpty()) {
            return AnalyticsDTO.builder()
                .totalScans(0)
                .healthyScans(0)
                .diseasedScans(0)
                .averageHealthScore(0.0)
                .averageConfidence(0.0)
                .mostCommonDisease("N/A")
                .mostScannedCrop("N/A")
                .diseaseBreakdown(Map.of())
                .cropBreakdown(Map.of())
                .severityBreakdown(Map.of())
                .healthScoreTrend(List.of())
                .build();
        }

        // Healthy vs diseased
        long healthy  = scans.stream()
            .filter(d -> "Healthy".equalsIgnoreCase(d.getSeverity()))
            .count();
        long diseased = scans.size() - healthy;

        // Average health score
        double avgHealth = scans.stream()
            .filter(d -> d.getHealthScore() != null)
            .mapToInt(Detection::getHealthScore)
            .average().orElse(0.0);

        // Average confidence
        double avgConf = scans.stream()
            .filter(d -> d.getConfidence() != null)
            .mapToDouble(Detection::getConfidence)
            .average().orElse(0.0);

        // Disease breakdown
        Map<String, Long> diseaseBreakdown = scans.stream()
            .filter(d -> d.getDiseaseName() != null)
            .collect(Collectors.groupingBy(Detection::getDiseaseName,
                     Collectors.counting()));

        // Most common disease
        String mostCommonDisease = diseaseBreakdown.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        // Crop breakdown
        Map<String, Long> cropBreakdown = scans.stream()
            .filter(d -> d.getCropType() != null)
            .collect(Collectors.groupingBy(Detection::getCropType,
                     Collectors.counting()));

        // Most scanned crop
        String mostScannedCrop = cropBreakdown.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        // Severity breakdown
        Map<String, Long> severityBreakdown = scans.stream()
            .filter(d -> d.getSeverity() != null)
            .collect(Collectors.groupingBy(Detection::getSeverity,
                     Collectors.counting()));

        // Health score trend — last 10 scans (reversed to oldest to newest)
        List<Integer> trend = scans.stream()
            .limit(10)
            .map(Detection::getHealthScore)
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                list -> { java.util.Collections.reverse(list); return list; }
            ));

        return AnalyticsDTO.builder()
            .totalScans(scans.size())
            .healthyScans((int) healthy)
            .diseasedScans((int) diseased)
            .averageHealthScore(Math.round(avgHealth * 10.0) / 10.0)
            .averageConfidence(Math.round(avgConf * 1000.0) / 10.0) // as %
            .mostCommonDisease(mostCommonDisease)
            .mostScannedCrop(mostScannedCrop)
            .diseaseBreakdown(diseaseBreakdown)
            .cropBreakdown(cropBreakdown)
            .severityBreakdown(severityBreakdown)
            .healthScoreTrend(trend)
            .build();
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}