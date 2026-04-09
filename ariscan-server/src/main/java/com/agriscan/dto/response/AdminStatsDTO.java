package com.agriscan.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AdminStatsDTO {

    private long   totalUsers;
    private long   totalScans;
    private long   severeScans;
    private long   healthyScans;
    private Double averageHealthScore;

    /** Top 5 diseases by frequency (disease name → count) */
    private Map<String, Long> topDiseases;

    /** Scans per crop type */
    private Map<String, Long> cropBreakdown;

    /** New users per month, key = "YYYY-MM" */
    private Map<String, Long> userGrowth;
}