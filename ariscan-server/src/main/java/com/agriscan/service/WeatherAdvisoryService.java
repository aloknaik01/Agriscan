package com.agriscan.service;

import com.agriscan.dto.response.WeatherAdvisoryDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherAdvisoryService {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private static final String OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

    // Gemini endpoint — gemini-2.0-flash 
    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherAdvisoryDTO getAdvisory(double latitude, double longitude,
                                          String cropType) {
        WeatherData weather = fetchWeather(latitude, longitude);
        String advisory = generateAdvisory(weather, cropType);
        AdvisoryResult result = parseAdvisory(advisory);

        return WeatherAdvisoryDTO.builder()
            .temperatureCelsius(weather.currentTemp)
            .humidity(weather.currentHumidity)
            .precipitationMm(weather.currentPrecip)
            .windSpeedKmh(weather.currentWindSpeed)
            .weatherDescription(describeWeather(weather))
            .forecast(weather.forecast)
            .cropAdvisory(result.advisory())
            .diseaseRiskLevel(result.riskLevel())
            .riskFactors(result.riskFactors())
            .build();
    }

    //  Open-Meteo 

    private WeatherData fetchWeather(double lat, double lon) {
        try {
            String url = OPEN_METEO_URL
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&current=temperature_2m,relative_humidity_2m,"
                +           "precipitation,wind_speed_10m"
                + "&daily=temperature_2m_max,temperature_2m_min,"
                +         "precipitation_sum,relative_humidity_2m_max"
                + "&timezone=auto"
                + "&forecast_days=4";

            String response = RestClient.create()
                .get().uri(url)
                .retrieve()
                .body(String.class);

            JsonNode root    = objectMapper.readTree(response);
            JsonNode current = root.path("current");
            JsonNode daily   = root.path("daily");

            double currentTemp      = current.path("temperature_2m").asDouble();
            double currentHumidity  = current.path("relative_humidity_2m").asDouble();
            double currentPrecip    = current.path("precipitation").asDouble();
            double currentWindSpeed = current.path("wind_speed_10m").asDouble();

            List<WeatherAdvisoryDTO.DailyForecast> forecast = new ArrayList<>();
            JsonNode dates   = daily.path("time");
            JsonNode maxTemp = daily.path("temperature_2m_max");
            JsonNode minTemp = daily.path("temperature_2m_min");
            JsonNode precip  = daily.path("precipitation_sum");
            JsonNode humid   = daily.path("relative_humidity_2m_max");

            for (int i = 1; i <= 3 && i < dates.size(); i++) {
                forecast.add(WeatherAdvisoryDTO.DailyForecast.builder()
                    .date(dates.get(i).asText())
                    .maxTempC(maxTemp.get(i).asDouble())
                    .minTempC(minTemp.get(i).asDouble())
                    .precipitationMm(precip.get(i).asDouble())
                    .humidityPercent(humid.get(i).asDouble())
                    .build());
            }

            return new WeatherData(currentTemp, currentHumidity,
                currentPrecip, currentWindSpeed, forecast);

        } catch (Exception e) {
            log.error("Failed to fetch weather data: {}", e.getMessage());
            return WeatherData.unknown();
        }
    }

    //  Gemini advisory 

    private String generateAdvisory(WeatherData w, String cropType) {
        String prompt = """
            You are an agricultural expert. Based on the following weather conditions,
            provide a crop advisory for a farmer growing %s.

            Current Weather:
            - Temperature: %.1f°C
            - Humidity: %.0f%%
            - Precipitation: %.1f mm
            - Wind Speed: %.1f km/h

            3-Day Forecast:
            %s

            Respond in this JSON format ONLY (no preamble, no markdown, no code fences):
            {
              "advisory": "2-3 sentence practical advice for the farmer",
              "diseaseRiskLevel": "Low|Medium|High",
              "riskFactors": ["factor1", "factor2"]
            }
            """.formatted(
                cropType,
                w.currentTemp, w.currentHumidity,
                w.currentPrecip, w.currentWindSpeed,
                formatForecast(w.forecast)
            );

        try {
            // Gemini request body
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature",     0.3,
                    "maxOutputTokens", 500
                )
            );

            String response = RestClient.create()
                .post()
                .uri(GEMINI_URL + "?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

            // Gemini response: candidates[0].content.parts[0].text
            JsonNode root = objectMapper.readTree(response);
            return root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text").asText();

        } catch (Exception e) {
            log.error("Gemini advisory failed: {}", e.getMessage());
            return "{\"advisory\":\"Monitor your crops closely given current conditions.\","
                 + "\"diseaseRiskLevel\":\"Medium\",\"riskFactors\":[\"Unable to assess\"]}";
        }
    }

    private AdvisoryResult parseAdvisory(String json) {
        try {
            // Strip markdown fences if Gemini wraps in ```json ... ```
            String clean = json.replaceAll("(?s)```json\\s*", "")
                               .replaceAll("```", "")
                               .trim();
            JsonNode node = objectMapper.readTree(clean);

            List<String> factors = new ArrayList<>();
            node.path("riskFactors").forEach(f -> factors.add(f.asText()));

            return new AdvisoryResult(
                node.path("advisory").asText("Monitor crops regularly."),
                node.path("diseaseRiskLevel").asText("Medium"),
                factors
            );
        } catch (Exception e) {
            log.warn("Failed to parse Gemini advisory JSON: {}", e.getMessage());
            return new AdvisoryResult("Monitor crops regularly.", "Medium", List.of());
        }
    }

    //  Helpers 

    private String describeWeather(WeatherData w) {
        if (w.currentPrecip > 5)    return "Rainy";
        if (w.currentHumidity > 80) return "Humid";
        if (w.currentTemp > 35)     return "Hot and Dry";
        if (w.currentTemp < 15)     return "Cool";
        return "Moderate";
    }

    private String formatForecast(List<WeatherAdvisoryDTO.DailyForecast> forecast) {
        StringBuilder sb = new StringBuilder();
        for (var f : forecast) {
            sb.append("  - ").append(f.getDate())
              .append(": max ").append(f.getMaxTempC()).append("°C")
              .append(", min ").append(f.getMinTempC()).append("°C")
              .append(", rain ").append(f.getPrecipitationMm()).append("mm")
              .append(", humidity ").append(f.getHumidityPercent()).append("%\n");
        }
        return sb.toString();
    }

    //  Inner types 

    private record WeatherData(
        double currentTemp,
        double currentHumidity,
        double currentPrecip,
        double currentWindSpeed,
        List<WeatherAdvisoryDTO.DailyForecast> forecast
    ) {
        static WeatherData unknown() {
            return new WeatherData(0, 0, 0, 0, List.of());
        }
    }

    private record AdvisoryResult(
        String advisory,
        String riskLevel,
        List<String> riskFactors
    ) {}
}