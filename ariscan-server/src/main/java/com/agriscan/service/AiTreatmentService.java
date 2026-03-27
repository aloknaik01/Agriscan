package com.agriscan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;


@Slf4j
@Service
public class AiTreatmentService {

    // If missing/blank, we return a safe fallback at request-time.
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String CLAUDE_API_URL =
        "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-4-20250514";

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate AI treatment advice for a detected disease.
     *
     * @param diseaseName  detected disease name
     * @param cropType     crop type
     * @param severity     severity level (Mild / Moderate / Severe)
     * @param confidence   detection confidence score
     * @return AiTreatmentResult with organic, chemical, dosage, prevention fields
     */
    public AiTreatmentResult generateTreatment(
            String diseaseName,
            String cropType,
            String severity,
            double confidence) {

        if (anthropicApiKey == null || anthropicApiKey.isBlank()) {
            log.warn("Anthropic API key is not configured. Returning fallback treatment.");
            return AiTreatmentResult.fallback(diseaseName, cropType);
        }

        String prompt = buildPrompt(diseaseName, cropType, severity, confidence);

        try {
            Map<String, Object> requestBody = Map.of(
                "model", MODEL,
                "max_tokens", 1000,
                "messages", List.of(
                    Map.of("role", "user", "content", prompt)
                )
            );

            String responseBody = RestClient.create()
                .post()
                .uri(CLAUDE_API_URL)
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

            return parseResponse(responseBody);

        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            return AiTreatmentResult.fallback(diseaseName, cropType);
        }
    }

    // Prompt builder 

    private String buildPrompt(String diseaseName, String cropType,
                               String severity, double confidence) {
        return String.format("""
            You are an agricultural expert. A farmer's crop scan has detected the following:

            - Crop: %s
            - Disease: %s
            - Severity: %s
            - Detection Confidence: %.0f%%

            Please provide treatment recommendations in the following JSON format ONLY
            (no preamble, no markdown, just raw JSON):

            {
              "organicRemedy": "...",
              "chemicalPesticide": "...",
              "pesticideDosage": "...",
              "preventiveMeasures": "..."
            }

            Keep each field to 1-2 concise sentences. Use practical, farmer-friendly language.
            If the crop appears healthy, say so in each field.
            """,
            cropType, diseaseName, severity, confidence * 100);
    }

    //  Response parser

    private AiTreatmentResult parseResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String text = root
            .path("content").get(0)
            .path("text").asText();

        // Strip markdown code fences if present
        text = text.replaceAll("```json", "").replaceAll("```", "").trim();

        JsonNode json = objectMapper.readTree(text);
        return new AiTreatmentResult(
            json.path("organicRemedy").asText("N/A"),
            json.path("chemicalPesticide").asText("N/A"),
            json.path("pesticideDosage").asText("N/A"),
            json.path("preventiveMeasures").asText("N/A"),
            true
        );
    }

    // Result record 

    public record AiTreatmentResult(
        String organicRemedy,
        String chemicalPesticide,
        String pesticideDosage,
        String preventiveMeasures,
        boolean aiGenerated
    ) {
        public static AiTreatmentResult fallback(String diseaseName, String cropType) {
            return new AiTreatmentResult(
                "Consult a local agronomist for organic remedies.",
                "Consult a local agronomist for chemical treatment.",
                "Dosage varies — consult product label.",
                "Maintain good field hygiene and monitor regularly.",
                false
            );
        }
    }
}