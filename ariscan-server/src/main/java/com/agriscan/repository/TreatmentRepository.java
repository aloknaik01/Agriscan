package com.agriscan.repository;

import com.agriscan.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {

    Optional<Treatment> findByDiseaseNameIgnoreCaseAndCropTypeIgnoreCase(
        String diseaseName, String cropType
    );

    Optional<Treatment> findByDiseaseNameIgnoreCase(String diseaseName);
}