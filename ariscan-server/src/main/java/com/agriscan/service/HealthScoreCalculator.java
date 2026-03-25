package com.agriscan.service;

import org.springframework.stereotype.Component;

@Component
public class HealthScoreCalculator {

    public int calculate(double confidence, String severity) {
        if (severity == null || severity.equalsIgnoreCase("Healthy")) {
            return 100;
        }
        int base    = (int) ((1.0 - confidence) * 100);
        int penalty = switch (severity.toLowerCase()) {
            case "mild"     -> 10;
            case "moderate" -> 25;
            case "severe"   -> 45;
            default         -> 20;
        };
        return Math.max(0, Math.min(100, base - penalty));
    }

    public String determineSeverity(double confidence) {
        if (confidence < 0.3)       return "Mild";
        else if (confidence < 0.65) return "Moderate";
        else                        return "Severe";
    }
}