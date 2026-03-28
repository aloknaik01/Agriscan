package com.agriscan.service;

import com.agriscan.dto.response.DetectionDTO;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectionService {

    private final CloudinaryService     cloudinaryService;
    private final PlantNetService       plantNetService;
    private final HealthScoreCalculator healthScoreCalculator;
    private final DetectionRepository   detectionRepository;
    private final TreatmentRepository   treatmentRepository;
    private final UserRepository        userRepository;
    private final AiTreatmentService    aiTreatmentService;
    private final EmailService         emailService; 

    // Analyze a new image
    public DetectionDTO analyze(MultipartFile image, String cropTypeHint)
            throws Exception {

        // 1. get logged-in user
        String email = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. upload to Cloudinary
        String imageUrl = cloudinaryService.uploadImage(image);

        // 3. call PlantNet (identify plant + disease in one call)
        PlantNetService.PlantNetResult result = plantNetService.analyze(image);

        // if user passed a crop type, prefer it over auto-detected
        String finalCropType = (cropTypeHint != null
            && !cropTypeHint.equalsIgnoreCase("Unknown"))
            ? cropTypeHint
            : result.getCropType();

        // 4. severity + health score
        String severity  = result.isHealthy() ? "Healthy"
            : healthScoreCalculator.determineSeverity(result.getConfidence());
        int healthScore  = healthScoreCalculator
            .calculate(result.getConfidence(), severity);

        /// 5. save to DB
        Detection detection = Detection.builder()
        	    .user(user)
        	    .imageUrl(imageUrl)
        	    .cropType(finalCropType)
        	    .diseaseName(result.getDiseaseName())
        	    .diseaseCategory(result.getDiseaseCategory())
        	    .description(result.getDescription())   
        	    .confidence(result.getConfidence())
        	    .severity(severity)
        	    .healthScore(healthScore)
        	    .status(DetectionStatus.COMPLETED)
        	    .build();

        
        detectionRepository.save(detection);
        // 6. find matching treatment
        TreatmentDTO treatmentDTO = getAiOrDbTreatment(
                result.getDiseaseName(), finalCropType, severity, result.getConfidence()
            );

        DetectionDTO dto = toDTO(detection, treatmentDTO);
        
        //  async emails 
        emailService.sendScanResultEmail(user, dto);
        emailService.sendSevereAlertEmail(user, dto);
 
        return dto;
    }

    //  Get scan history for logged-in user 

    public List<DetectionDTO> getHistory() {
        User user = getLoggedInUser();
        return detectionRepository
            .findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(d -> toDTO(d, findTreatment(d.getDiseaseName(), d.getCropType())))
            .toList();
    }

    //  Get single detection 

    public DetectionDTO getById(Long id) {
        Detection d = detectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Detection not found"));
        return toDTO(d, findTreatment(d.getDiseaseName(), d.getCropType()));
    }

    // Helpers 

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Treatment findTreatment(String diseaseName, String cropType) {
        if (diseaseName == null) return null;
        return treatmentRepository
            .findByDiseaseNameIgnoreCaseAndCropTypeIgnoreCase(
                diseaseName, cropType != null ? cropType : ""
            )
            .or(() -> treatmentRepository
                .findByDiseaseNameIgnoreCase(diseaseName))
            .orElse(null);
    }

    
    //  mapper: Detection + Treatment to DTO 

    private DetectionDTO toDTO(Detection d, Treatment t) {
        DetectionDTO dto = new DetectionDTO();
        dto.setId(d.getId());
        dto.setImageUrl(d.getImageUrl());
        dto.setCropType(d.getCropType());
        dto.setDiseaseName(d.getDiseaseName());
        dto.setDiseaseCategory(d.getDiseaseCategory());
        dto.setDescription(d.getDescription());
        dto.setConfidence(d.getConfidence());
        dto.setSeverity(d.getSeverity());
        dto.setHealthScore(d.getHealthScore());
        dto.setStatus(d.getStatus() != null ? d.getStatus().name() : null);
        dto.setCreatedAt(d.getCreatedAt());

        if (t != null) {
            TreatmentDTO tdto = new TreatmentDTO();
            tdto.setId(t.getId());
            tdto.setOrganicRemedy(t.getOrganicRemedy());
            tdto.setChemicalPesticide(t.getChemicalPesticide());
            tdto.setPesticideDosage(t.getPesticideDosage());
            tdto.setPreventiveMeasures(t.getPreventiveMeasures());
            dto.setTreatment(tdto);
        }

        return dto;
    }
    
    // Search & Filter
    
    public List<DetectionDTO> search(String cropType, String disease,
            LocalDateTime from, LocalDateTime to) {
User user = getLoggedInUser();
return detectionRepository
.search(user.getId(),
blankToNull(cropType),
blankToNull(disease),
from, to)
.stream()
.map(d -> toDTO(d, getDbTreatmentDTO(d.getDiseaseName(), d.getCropType())))
.toList();
}
    
    
    
    
    //  Delete single
    
    @Transactional
    public void deleteById(Long id) {
        User user = getLoggedInUser();
        if (!detectionRepository.existsByIdAndUserId(id, user.getId())) {
            throw new RuntimeException("Detection not found or access denied");
        }
        detectionRepository.deleteById(id);
    }
    
    // Delete all history
    @Transactional
    public void deleteAllHistory() {
        User user = getLoggedInUser();
        detectionRepository.deleteAllByUserId(user.getId());
    }
    
    
    
    /** Try AI treatment; if it fails or aiGenerated=false, fall back to DB. */
    private TreatmentDTO getAiOrDbTreatment(String diseaseName, String cropType,
                                             String severity, double confidence) {
        try {
            AiTreatmentService.AiTreatmentResult ai =
                aiTreatmentService.generateTreatment(
                    diseaseName, cropType, severity, confidence);
 
            TreatmentDTO dto = new TreatmentDTO();
            dto.setOrganicRemedy(ai.organicRemedy());
            dto.setChemicalPesticide(ai.chemicalPesticide());
            dto.setPesticideDosage(ai.pesticideDosage());
            dto.setPreventiveMeasures(ai.preventiveMeasures());
            dto.setAiGenerated(ai.aiGenerated());
            return dto;
 
        } catch (Exception e) {
            log.warn("AI treatment failed, using DB fallback: {}", e.getMessage());
            return getDbTreatmentDTO(diseaseName, cropType);
        }
    }
    
    
    private TreatmentDTO getDbTreatmentDTO(String diseaseName, String cropType) {
        Treatment t = findTreatmentFromDb(diseaseName, cropType);
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
    
    
    private Treatment findTreatmentFromDb(String diseaseName, String cropType) {
        if (diseaseName == null) return null;
        return treatmentRepository
            .findByDiseaseNameIgnoreCaseAndCropTypeIgnoreCase(
                diseaseName, cropType != null ? cropType : "")
            .or(() -> treatmentRepository
                .findByDiseaseNameIgnoreCase(diseaseName))
            .orElse(null);
    }
    
    
    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
    
    private DetectionDTO toDTO(Detection d, TreatmentDTO treatmentDTO) {
        DetectionDTO dto = new DetectionDTO();
        dto.setId(d.getId());
        dto.setImageUrl(d.getImageUrl());
        dto.setCropType(d.getCropType());
        dto.setDiseaseName(d.getDiseaseName());
        dto.setDiseaseCategory(d.getDiseaseCategory());
        dto.setDescription(d.getDescription());
        dto.setConfidence(d.getConfidence());
        dto.setSeverity(d.getSeverity());
        dto.setHealthScore(d.getHealthScore());
        dto.setStatus(d.getStatus() != null ? d.getStatus().name() : null);
        dto.setCreatedAt(d.getCreatedAt());
        dto.setTreatment(treatmentDTO);
        return dto;
    }
    
    
}