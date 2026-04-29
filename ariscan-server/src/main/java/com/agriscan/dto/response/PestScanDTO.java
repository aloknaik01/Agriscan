package com.agriscan.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for pest scan results.
 * Returned by POST /api/v1/pest/analyze and GET /api/v1/pest/{id}
 */
@Data
@Builder
public class PestScanDTO {

    private Long   id;
    private String imageUrl;
    private String cropType;

    // Insect identification
    private String scientificName;
    private String commonName;
    private Double confidence;

    // Taxonomy
    private String taxonomyOrder;
    private String taxonomyFamily;
    private String taxonomyClass;

    // Description
    private String description;

    // Tags from insect.id
    private List<String> dangerTags;
    private List<String> roleTags;

    // Threat assessment
    private Boolean isCropPest;
    private String  threatLevel;    // Beneficial / Low / Medium / High

    // Control advice (Gemini-generated)
    private String organicControl;
    private String chemicalControl;
    private String preventiveMeasures;
    private String cropImpact;

    private String        status;
    private LocalDateTime createdAt;
}