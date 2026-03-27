package com.agriscan.repository;

import com.agriscan.entity.Detection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DetectionRepository extends JpaRepository<Detection, Long> {

    List<Detection> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Detection> findByUserIdAndCropType(Long userId, String cropType);

    List<Detection> findByUserIdAndDiseaseName(Long userId, String diseaseName);



    @Query("""
            SELECT d FROM Detection d
            WHERE d.user.id = :userId
              AND (:cropType   IS NULL OR LOWER(d.cropType)   LIKE LOWER(CONCAT('%', :cropType,   '%')))
              AND (:disease    IS NULL OR LOWER(d.diseaseName) LIKE LOWER(CONCAT('%', :disease,    '%')))
              AND (:from       IS NULL OR d.createdAt >= :from)
              AND (:to         IS NULL OR d.createdAt <= :to)
            ORDER BY d.createdAt DESC
            """)
        List<Detection> search(
            @Param("userId")   Long userId,
            @Param("cropType") String cropType,
            @Param("disease")  String disease,
            @Param("from")     LocalDateTime from,
            @Param("to")       LocalDateTime to
        );
    
    
 //  Delete 
    
    /** Delete all detections for a user (clear history). */
    @Modifying
    @Query("DELETE FROM Detection d WHERE d.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
 
    /** Check ownership before delete. */
    boolean existsByIdAndUserId(Long id, Long userId);


}