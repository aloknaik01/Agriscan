package com.agriscan.service;

import com.agriscan.dto.response.DetectionDTO;
import com.agriscan.dto.response.PagedDetectionDTO;
import com.agriscan.dto.response.TreatmentDTO;
import com.agriscan.entity.Detection;
import com.agriscan.entity.Detection.DetectionStatus;
import com.agriscan.entity.Treatment;
import com.agriscan.entity.User;
import com.agriscan.repository.DetectionRepository;
import com.agriscan.repository.TreatmentRepository;
import com.agriscan.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectionService {

    private static final long        MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES   = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final CloudinaryService     cloudinaryService;
    private final KindwiseService       kindwiseService;        // ← replaces PlantNetService
    private final HealthScoreCalculator healthScoreCalculator;
    private final DetectionRepository   detectionRepository;
    private final TreatmentRepository   treatmentRepository;
    private final UserRepository        userRepository;
    private final AiTreatmentService    aiTreatmentService;     // ← fallback only now
    private final EmailService          emailService;
    private final AnalyticsService      analyticsService;

    @Transactional
    public DetectionDTO analyze(MultipartFile image, String cropTypeHint) throws Exception {
        validateImage(image);
        User   user     = getLoggedInUser();
        String imageUrl = cloudinaryService.uploadImage(image);

        // ── Call Kindwise plant.id v3 ──────────────────────────
        KindwiseService.KindwiseResult result = kindwiseService.analyze(image);

        String finalCropType = (cropTypeHint != null && !cropTypeHint.equalsIgnoreCase("Unknown"))
            ? cropTypeHint : result.getCropType();

        String severity    = result.isHealthy() ? "Healthy"
            : healthScoreCalculator.determineSeverity(result.getConfidence());
        int    healthScore = healthScoreCalculator.calculate(result.getConfidence(), severity);

        Detection detection = Detection.builder()
            .user(user).imageUrl(imageUrl).cropType(finalCropType)
            .diseaseName(result.getDiseaseName())
            .diseaseCategory(result.getDiseaseCategory())
            .diseaseType(result.getDiseaseType())
            .description(result.getDescription())
            .symptoms(result.getSymptoms())
            .confidence(result.getConfidence())
            .severity(severity).healthScore(healthScore)
            .status(DetectionStatus.COMPLETED)
            .build();

        detectionRepository.save(detection);
        analyticsService.evictForUser(user.getEmail());

        // ── Treatment: plant.id native → DB → Gemini (priority order) ──
        TreatmentDTO treatmentDTO = resolveTreatment(result, finalCropType, severity);

        DetectionDTO dto = toDTO(detection, treatmentDTO);
        emailService.sendScanResultEmail(user, dto);
        emailService.sendSevereAlertEmail(user, dto);
        return dto;
    }

    // ── Treatment resolution (3-tier) ─────────────────────────

    /**
     * Priority:
     *   1. plant.id API returned treatment natively → use it directly
     *   2. Local DB has a matching treatment row     → use it
     *   3. Gemini AI generates treatment             → use it
     *   4. Hard fallback message                     → last resort
     */
    private TreatmentDTO resolveTreatment(KindwiseService.KindwiseResult result,
                                           String cropType, String severity) {
        // Tier 1: Native from plant.id (biological / chemical / prevention)
        if (result.isTreatmentFromApi()
                && result.getPreventiveMeasures() != null) {
            TreatmentDTO dto = new TreatmentDTO();
            dto.setOrganicRemedy(result.getOrganicRemedy());
            dto.setChemicalPesticide(result.getChemicalPesticide());
            dto.setPesticideDosage(null);           // plant.id doesn't return dosage
            dto.setPreventiveMeasures(result.getPreventiveMeasures());
            dto.setAiGenerated(false);
            log.debug("Treatment resolved from plant.id API for: {}", result.getDiseaseName());
            return dto;
        }

        // Tier 2: Local DB
        TreatmentDTO dbDto = getDbTreatmentDTO(result.getDiseaseName(), cropType);
        if (dbDto != null) {
            log.debug("Treatment resolved from DB for: {}", result.getDiseaseName());
            return dbDto;
        }

        // Tier 3: Gemini AI fallback
        try {
            AiTreatmentService.AiTreatmentResult ai =
                aiTreatmentService.generateTreatment(
                    result.getDiseaseName(), cropType, severity, result.getConfidence());
            TreatmentDTO dto = new TreatmentDTO();
            dto.setOrganicRemedy(ai.organicRemedy());
            dto.setChemicalPesticide(ai.chemicalPesticide());
            dto.setPesticideDosage(ai.pesticideDosage());
            dto.setPreventiveMeasures(ai.preventiveMeasures());
            dto.setAiGenerated(ai.aiGenerated());
            log.debug("Treatment resolved from Gemini AI for: {}", result.getDiseaseName());
            return dto;
        } catch (Exception e) {
            log.warn("All treatment sources failed for {}: {}", result.getDiseaseName(), e.getMessage());
            TreatmentDTO fallback = new TreatmentDTO();
            fallback.setOrganicRemedy("Consult a local agronomist for organic remedies.");
            fallback.setChemicalPesticide("Consult a local agronomist for chemical treatment.");
            fallback.setPesticideDosage("Dosage varies — consult product label.");
            fallback.setPreventiveMeasures("Maintain good field hygiene and monitor regularly.");
            fallback.setAiGenerated(false);
            return fallback;
        }
    }

    // ── History ───────────────────────────────────────────────

    public PagedDetectionDTO getHistory(int page, int size) {
        User user = getLoggedInUser();
        int safeSize = Math.min(size, 50);
        Page<Detection> pageResult = detectionRepository.findByUserIdOrderByCreatedAtDesc(
            user.getId(), PageRequest.of(page, safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")));
        List<DetectionDTO> content = pageResult.getContent().stream()
            .map(d -> toDTO(d, getDbTreatmentDTO(d.getDiseaseName(), d.getCropType())))
            .toList();
        return PagedDetectionDTO.builder()
            .content(content).page(pageResult.getNumber()).size(pageResult.getSize())
            .totalElements(pageResult.getTotalElements()).totalPages(pageResult.getTotalPages())
            .first(pageResult.isFirst()).last(pageResult.isLast()).build();
    }

    public DetectionDTO getById(Long id) {
        Detection d = detectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Detection not found"));
        return toDTO(d, getDbTreatmentDTO(d.getDiseaseName(), d.getCropType()));
    }

    public List<DetectionDTO> search(String cropType, String disease,
                                     LocalDateTime from, LocalDateTime to) {
        User user = getLoggedInUser();
        return detectionRepository
            .search(user.getId(), blankToNull(cropType), blankToNull(disease), from, to)
            .stream()
            .map(d -> toDTO(d, getDbTreatmentDTO(d.getDiseaseName(), d.getCropType())))
            .toList();
    }

    @Transactional
    public void deleteById(Long id) {
        User user = getLoggedInUser();
        if (!detectionRepository.existsByIdAndUserId(id, user.getId()))
            throw new RuntimeException("Detection not found or access denied");
        detectionRepository.deleteById(id);
        analyticsService.evictForUser(user.getEmail());
    }

    @Transactional
    public void deleteAllHistory() {
        User user = getLoggedInUser();
        detectionRepository.deleteAllByUserId(user.getId());
        analyticsService.evictForUser(user.getEmail());
    }

    // ── Private helpers ───────────────────────────────────────

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty())
            throw new RuntimeException("Image file is required");
        if (image.getSize() > MAX_IMAGE_BYTES)
            throw new RuntimeException("Image exceeds 10 MB limit");
        String ct = image.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct.toLowerCase()))
            throw new RuntimeException("Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF");
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TreatmentDTO getDbTreatmentDTO(String diseaseName, String cropType) {
        if (diseaseName == null) return null;
        Treatment t = treatmentRepository
            .findByDiseaseNameIgnoreCaseAndCropTypeIgnoreCase(
                diseaseName, cropType != null ? cropType : "")
            .or(() -> treatmentRepository.findByDiseaseNameIgnoreCase(diseaseName))
            .orElse(null);
        if (t == null) return null;
        TreatmentDTO dto = new TreatmentDTO();
        dto.setId(t.getId());
        dto.setOrganicRemedy(t.getOrganicRemedy());
        dto.setChemicalPesticide(t.getChemicalPesticide());
        dto.setPesticideDosage(t.getPesticideDosage());
        dto.setPreventiveMeasures(t.getPreventiveMeasures());
        dto.setAiGenerated(false);
        return dto;
    }

    private DetectionDTO toDTO(Detection d, TreatmentDTO t) {
        DetectionDTO dto = new DetectionDTO();
        dto.setId(d.getId()); dto.setImageUrl(d.getImageUrl());
        dto.setCropType(d.getCropType()); dto.setDiseaseName(d.getDiseaseName());
        dto.setDiseaseCategory(d.getDiseaseCategory());
        dto.setDiseaseType(d.getDiseaseType());
        dto.setDescription(d.getDescription());
        dto.setSymptoms(d.getSymptoms());
        dto.setConfidence(d.getConfidence()); dto.setSeverity(d.getSeverity());
        dto.setHealthScore(d.getHealthScore());
        dto.setStatus(d.getStatus() != null ? d.getStatus().name() : null);
        dto.setCreatedAt(d.getCreatedAt()); dto.setTreatment(t);
        return dto;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}