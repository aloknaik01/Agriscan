package com.agriscan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "treatments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String diseaseName;

    private String cropType;       

    @Column(columnDefinition = "TEXT")
    private String organicRemedy;

    @Column(columnDefinition = "TEXT")
    private String chemicalPesticide;

    private String pesticideDosage;

    @Column(columnDefinition = "TEXT")
    private String preventiveMeasures;
}