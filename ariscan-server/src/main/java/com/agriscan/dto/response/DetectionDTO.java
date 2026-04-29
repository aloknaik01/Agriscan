package com.agriscan.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DetectionDTO {
    private Long id;
    private String imageUrl;
    private String cropType;
    private String diseaseName;
    private String diseaseCategory;
    private String diseaseType;     // Fungi / Bacteria / Virus / Pest / Abiotic
    private String description;
    private String symptoms;        // Visible symptom description
    private Double confidence;
    private String severity;
    private Integer healthScore;
    private String status;
    private LocalDateTime createdAt;
    private TreatmentDTO treatment;
}