package com.agriscan.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;


 // Weather + AI crop advisory response.

@Data
@Builder
public class WeatherAdvisoryDTO {

    // Current weather
    private Double  temperatureCelsius;
    private Double  humidity;
    private Double  precipitationMm;
    private Double  windSpeedKmh;
    private String  weatherDescription;

    // 3-day forecast summary
    private List<DailyForecast> forecast;

    // AI-generated advisory
    private String cropAdvisory;
    private String diseaseRiskLevel;    // Low / Medium / High
    private List<String> riskFactors;

    @Data
    @Builder
    public static class DailyForecast {
        private String date;
        private Double maxTempC;
        private Double minTempC;
        private Double precipitationMm;
        private Double humidityPercent;
    }
}