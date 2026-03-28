package com.agriscan.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;


 // Admin view of a user with scan summary stats.

@Data
@Builder
public class AdminUserDTO {
    private Long          id;
    private String        name;
    private String        email;
    private String        phone;
    private String        region;
    private String        state;
    private Double        farmSize;
    private List<String>  crops;
    private String        language;
    private String        role;
    private LocalDateTime createdAt;

    // Scan summary
    private int    totalScans;
    private int    severeScans;
    private Double averageHealthScore;
    private String lastScanDisease;
    private LocalDateTime lastScanAt;
}