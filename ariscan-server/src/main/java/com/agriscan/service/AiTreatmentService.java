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

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    // ✅ correct model
    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiTreatmentResult generateTreatment(
            String diseaseName, String cropType,
            String severity, double confidence) {

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("Gemini API key not configured. Returning fallback treatment.");
            return AiTreatmentResult.fallback(diseaseName, cropType);
        }

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", buildPrompt(diseaseName, cropType, severity, confidence))
                    ))
                ),
                "generationConfig", Map.of(
                    "thinkingConfig", Map.of("thinkingLevel", "low"),
                    "maxOutputTokens", 600
                )
            );

            String responseBody = RestClient.create()
                .post()
                .uri(GEMINI_URL)
                .header("x-goog-api-key", geminiApiKey)  // ✅ correct header
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

            return parseResponse(responseBody);

        } catch (Exception e) {
            log.error("Gemini treatment API call failed: {}", e.getMessage());
            return AiTreatmentResult.fallback(diseaseName, cropType);
        }
    }

    // ── Prompt ────────────────────────────────────────────────

    private String buildPrompt(String diseaseName, String cropType,
                                String severity, double confidence) {
        return String.format("""
            You are an agricultural expert. A farmer's crop scan detected:

            - Crop: %s
            - Disease: %s
            - Severity: %s
            - Detection Confidence: %.0f%%

            Provide treatment recommendations in this JSON format ONLY
            (no preamble, no markdown, no code fences, just raw JSON):

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

    // ── Parser ────────────────────────────────────────────────

    private AiTreatmentResult parseResponse(String responseBody) throws Exception {
        JsonNode root  = objectMapper.readTree(responseBody);
        JsonNode parts = root.path("candidates").get(0)
                             .path("content").path("parts");

        // gemini-3-flash-preview with thinking enabled returns multiple parts.
        // The first part may contain only a "thoughtSignature" (internal reasoning blob).
        // We must find the first part that actually has a non-empty "text" field.
        String text = "";
        for (JsonNode part : parts) {
            String candidate = part.path("text").asText("").trim();
            if (!candidate.isEmpty()) {
                text = candidate;
                break;
            }
        }

        if (text.isEmpty()) {
            log.warn("No text content found in Gemini treatment response");
            return AiTreatmentResult.fallback("Unknown", "Unknown");
        }

        // Strip markdown fences if present
        text = text.replaceAll("(?s)```json\\s*", "")
                   .replaceAll("```", "").trim();

        JsonNode json = objectMapper.readTree(text);
        return new AiTreatmentResult(
            json.path("organicRemedy").asText("N/A"),
            json.path("chemicalPesticide").asText("N/A"),
            json.path("pesticideDosage").asText("N/A"),
            json.path("preventiveMeasures").asText("N/A"),
            true
        );
    }

    // ── Result ────────────────────────────────────────────────

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