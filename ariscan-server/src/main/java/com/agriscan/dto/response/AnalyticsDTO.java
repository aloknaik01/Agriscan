package com.agriscan.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;


@Data
@Builder
public class AnalyticsDTO {

    private int totalScans;
    private int healthyScans;
    private int diseasedScans;
    private Double averageHealthScore;
    private Double averageConfidence;

    /** Most frequently detected disease name */
    private String mostCommonDisease;

    /** Most frequently scanned crop type */
    private String mostScannedCrop;

    /** Count of scans per disease name */
    private Map<String, Long> diseaseBreakdown;

    /** Count of scans per crop type */
    private Map<String, Long> cropBreakdown;

    /** Count of scans per severity level */
    private Map<String, Long> severityBreakdown;

    /** Health score trend — last 10 scans (oldest yo newest) */
    private List<Integer> healthScoreTrend;
}