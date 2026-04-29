package com.agriscan.service;

import com.agriscan.dto.response.PagedPestScanDTO;
import com.agriscan.dto.response.PestScanDTO;
import com.agriscan.entity.PestScan;
import com.agriscan.entity.PestScan.PestScanStatus;
import com.agriscan.entity.User;
import com.agriscan.repository.PestScanRepository;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Orchestrates the full pest scan pipeline:
 * 1. Validate image
 * 2. Upload to Cloudinary
 * 3. Call PestScanService (insect.id + Gemini)
 * 4. Save to pest_scans table
 * 5. Send async email notification
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PestScanManagementService {

    private static final long        MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES   = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final PestScanService    pestScanService;
    private final CloudinaryService  cloudinaryService;
    private final PestScanRepository pestScanRepository;
    private final UserRepository     userRepository;
    private final PestPdfReportService pestPdfReportService;

    // ── Analyze ───────────────────────────────────────────────

    @Transactional
    public PestScanDTO analyze(MultipartFile image, String cropType) throws Exception {
        validateImage(image);

        User   user     = getLoggedInUser();
        String imageUrl = cloudinaryService.uploadImage(image);

        PestScanService.PestScanResult result =
            pestScanService.analyze(image, cropType);

        PestScan scan = PestScan.builder()
            .user(user)
            .imageUrl(imageUrl)
            .cropType(cropType)
            .scientificName(result.getScientificName())
            .commonName(result.getCommonName())
            .confidence(result.getConfidence())
            .taxonomyOrder(result.getTaxonomyOrder())
            .taxonomyFamily(result.getTaxonomyFamily())
            .taxonomyClass(result.getTaxonomyClass())
            .description(result.getDescription())
            .dangerTags(joinTags(result.getDangerTags()))
            .roleTags(joinTags(result.getRoleTags()))
            .isCropPest(result.getIsCropPest())
            .threatLevel(result.getThreatLevel())
            .organicControl(result.getOrganicControl())
            .chemicalControl(result.getChemicalControl())
            .preventiveMeasures(result.getPreventiveMeasures())
            .cropImpact(result.getCropImpact())
            .status(PestScanStatus.COMPLETED)
            .build();

        pestScanRepository.save(scan);
        return toDTO(scan);
    }

    // ── History ───────────────────────────────────────────────

    public PagedPestScanDTO getHistory(int page, int size) {
        User user    = getLoggedInUser();
        int safeSize = Math.min(size, 50);

        Page<PestScan> pageResult = pestScanRepository.findByUserIdOrderByCreatedAtDesc(
            user.getId(),
            PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<PestScanDTO> content = pageResult.getContent().stream()
            .map(this::toDTO).toList();

        return PagedPestScanDTO.builder()
            .content(content)
            .page(pageResult.getNumber())
            .size(pageResult.getSize())
            .totalElements(pageResult.getTotalElements())
            .totalPages(pageResult.getTotalPages())
            .first(pageResult.isFirst())
            .last(pageResult.isLast())
            .build();
    }

    // ── Get by ID ─────────────────────────────────────────────

    public PestScanDTO getById(Long id) {
        PestScan scan = pestScanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pest scan not found"));
        return toDTO(scan);
    }

    // ── PDF report ────────────────────────────────────────────

    public byte[] generateReport(Long id) throws Exception {
        PestScan scan = pestScanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pest scan not found"));
        return pestPdfReportService.generateReport(toDTO(scan));
    }

    // ── Delete ────────────────────────────────────────────────

    @Transactional
    public void deleteById(Long id) {
        User user = getLoggedInUser();
        if (!pestScanRepository.existsByIdAndUserId(id, user.getId()))
            throw new RuntimeException("Pest scan not found or access denied");
        pestScanRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllHistory() {
        User user = getLoggedInUser();
        pestScanRepository.deleteAllByUserId(user.getId());
    }

    // ── Mapper ────────────────────────────────────────────────

    private PestScanDTO toDTO(PestScan s) {
        return PestScanDTO.builder()
            .id(s.getId())
            .imageUrl(s.getImageUrl())
            .cropType(s.getCropType())
            .scientificName(s.getScientificName())
            .commonName(s.getCommonName())
            .confidence(s.getConfidence())
            .taxonomyOrder(s.getTaxonomyOrder())
            .taxonomyFamily(s.getTaxonomyFamily())
            .taxonomyClass(s.getTaxonomyClass())
            .description(s.getDescription())
            .dangerTags(splitTags(s.getDangerTags()))
            .roleTags(splitTags(s.getRoleTags()))
            .isCropPest(s.getIsCropPest())
            .threatLevel(s.getThreatLevel())
            .organicControl(s.getOrganicControl())
            .chemicalControl(s.getChemicalControl())
            .preventiveMeasures(s.getPreventiveMeasures())
            .cropImpact(s.getCropImpact())
            .status(s.getStatus() != null ? s.getStatus().name() : null)
            .createdAt(s.getCreatedAt())
            .build();
    }

    // ── Helpers ───────────────────────────────────────────────

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

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return String.join(",", tags);
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) return Collections.emptyList();
        return Arrays.asList(tags.split(","));
    }
}