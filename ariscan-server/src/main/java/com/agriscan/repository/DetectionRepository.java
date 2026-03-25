package com.agriscan.repository;

import com.agriscan.entity.Detection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DetectionRepository extends JpaRepository<Detection, Long> {

    List<Detection> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Detection> findByUserIdAndCropType(Long userId, String cropType);

    List<Detection> findByUserIdAndDiseaseName(Long userId, String diseaseName);
}