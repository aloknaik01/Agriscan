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
    private String description;
    private Double confidence;
    private String severity;
    private Integer healthScore;
    private String status;
    private LocalDateTime createdAt;
    private TreatmentDTO treatment;
}