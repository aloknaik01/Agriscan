package com.agriscan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Stores pest scan results from insect.id + Gemini.
 * Separate table from detections — pest scans are a distinct feature.
 */
@Entity
@Table(name = "pest_scans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PestScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String imageUrl;

    private String cropType;            // crop the insect was found on

    private String scientificName;      // e.g. Harmonia axyridis
    private String commonName;          // e.g. Asian Lady Beetle
    private Double confidence;

    private String taxonomyOrder;       // e.g. Coleoptera
    private String taxonomyFamily;      // e.g. Coccinellidae
    private String taxonomyClass;       // e.g. Insecta

    @Column(columnDefinition = "TEXT")
    private String description;

    // Stored as comma-separated strings (simple, no extra join table needed)
    private String dangerTags;          // e.g. "agriculture or garden pest,bites or stings"
    private String roleTags;            // e.g. "beneficial,pollinator"

    private Boolean isCropPest;
    private String  threatLevel;        // Beneficial / Low / Medium / High

    // Gemini-generated control advice
    @Column(columnDefinition = "TEXT")
    private String organicControl;

    @Column(columnDefinition = "TEXT")
    private String chemicalControl;

    @Column(columnDefinition = "TEXT")
    private String preventiveMeasures;

    @Column(columnDefinition = "TEXT")
    private String cropImpact;

    @Enumerated(EnumType.STRING)
    private PestScanStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum PestScanStatus {
        PROCESSING, COMPLETED, FAILED
    }
}