package com.agriscan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "detections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Detection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String imageUrl;             

    private String cropType;             

    private String diseaseName;          

    private String diseaseCategory;      

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double confidence;           
    private String severity;             

    private Integer healthScore;         

    @Enumerated(EnumType.STRING)
    private DetectionStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum DetectionStatus {
        PROCESSING, COMPLETED, FAILED
    }
}