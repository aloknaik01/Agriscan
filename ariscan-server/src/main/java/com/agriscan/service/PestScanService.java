package com.agriscan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
public class PestScanService {

    private static final String INSECT_ID_URL =
        "https://insect.kindwise.com/api/v1/identification";

    @Value("${kindwise.insect-id-api-key}")
    private String insectIdApiKey;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Public entry point ────────────────────────────────────

    public PestScanResult analyze(MultipartFile image, String cropType) {
        try {
            byte[] imageBytes = image.getBytes();
            String base64     = Base64.getEncoder().encodeToString(imageBytes);

            InsectIdResult insectResult = callInsectId(base64);

            // Generate crop-specific control advice via Gemini
            PestControlAdvice advice = generateControlAdvice(
                insectResult, cropType);

            return PestScanResult.builder()
                .scientificName(insectResult.scientificName())
                .commonName(insectResult.commonName())
                .confidence(insectResult.confidence())
                .taxonomyOrder(insectResult.order())
                .taxonomyFamily(insectResult.family())
                .taxonomyClass(insectResult.insectClass())
                .description(insectResult.description())
                .dangerTags(insectResult.dangerTags())
                .roleTags(insectResult.roleTags())
                .isCropPest(insectResult.isCropPest())
                .threatLevel(determineThreatLevel(insectResult))
                .organicControl(advice.organicControl())
                .chemicalControl(advice.chemicalControl())
                .preventiveMeasures(advice.preventiveMeasures())
                .cropImpact(advice.cropImpact())
                .build();

        } catch (Exception e) {
            log.error("Pest scan analysis failed: {}", e.getMessage());
            return PestScanResult.unknown();
        }
    }

    // ── insect.id API call ────────────────────────────────────

    private InsectIdResult callInsectId(String base64Image) throws Exception {

        Map<String, Object> requestBody = Map.of(
            "images",         List.of(base64Image),
            "similar_images", false
        );

        // Request details: common_names, taxonomy, description, danger, role
        String responseBody = RestClient.create()
            .post()
            .uri(INSECT_ID_URL
                + "?details=common_names,taxonomy,description,danger,role"
                + "&language=en")
            .header("Api-Key", insectIdApiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(requestBody)
            .retrieve()
            .body(String.class);

        log.debug("insect.id raw response: {}", responseBody);
        return parseInsectResponse(responseBody);
    }

    // ── insect.id response parser ─────────────────────────────

    private InsectIdResult parseInsectResponse(String json) throws Exception {
        JsonNode root   = objectMapper.readTree(json);
        JsonNode result = root.path("result");

        // Check if image contains an insect
        boolean isInsect = result.path("is_insect").path("binary").asBoolean(true);
        if (!isInsect) {
            log.warn("insect.id: image does not appear to contain an insect");
            return InsectIdResult.unknown();
        }

        JsonNode suggestions = result.path("classification").path("suggestions");
        if (suggestions.isMissingNode() || suggestions.isEmpty()) {
            return InsectIdResult.unknown();
        }

        JsonNode top     = suggestions.get(0);
        JsonNode details = top.path("details");

        String scientificName = top.path("name").asText("Unknown Insect");
        double confidence     = top.path("probability").asDouble(0.0);

        // Common name (first English one)
        String commonName = scientificName;
        JsonNode commonNames = details.path("common_names");
        if (!commonNames.isMissingNode() && commonNames.isArray() && commonNames.size() > 0) {
            commonName = commonNames.get(0).asText(scientificName);
        }

        // Taxonomy
        JsonNode taxonomy = details.path("taxonomy");
        String order      = taxonomy.path("order").asText(null);
        String family     = taxonomy.path("family").asText(null);
        String insectClass= taxonomy.path("class").asText(null);

        // Description (Wikipedia / GPT combined)
        String description = null;
        JsonNode descNode  = details.path("description");
        if (!descNode.isMissingNode()) {
            // description_all returns combined Wikipedia + GPT
            if (descNode.isObject()) {
                description = descNode.path("value").asText(null);
            } else {
                description = descNode.asText(null);
            }
        }

        // Danger tags
        List<String> dangerTags = new ArrayList<>();
        JsonNode dangerNode     = details.path("danger");
        if (!dangerNode.isMissingNode() && dangerNode.isArray()) {
            dangerNode.forEach(d -> dangerTags.add(d.asText()));
        }

        // Role tags
        List<String> roleTags = new ArrayList<>();
        JsonNode roleNode     = details.path("role");
        if (!roleNode.isMissingNode() && roleNode.isArray()) {
            roleNode.forEach(r -> roleTags.add(r.asText()));
        }

        // Determine if this is a crop pest
        boolean isCropPest = roleTags.stream()
            .anyMatch(r -> r.toLowerCase().contains("pest"))
            || dangerTags.stream()
            .anyMatch(d -> d.toLowerCase().contains("pest"));

        return new InsectIdResult(
            scientificName, commonName, confidence,
            order, family, insectClass,
            description, dangerTags, roleTags, isCropPest
        );
    }

    // ── Gemini crop control advice ────────────────────────────

    private PestControlAdvice generateControlAdvice(InsectIdResult insect, String cropType) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return PestControlAdvice.fallback();
        }

        String prompt = buildControlPrompt(insect, cropType);

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                    "maxOutputTokens", 600
                )
            );

            String responseBody = RestClient.create()
                .post()
                .uri(GEMINI_URL)
                .header("x-goog-api-key", geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

            JsonNode root  = objectMapper.readTree(responseBody);
            JsonNode parts = root.path("candidates").get(0)
                                 .path("content").path("parts");

            String text = "";
            for (JsonNode part : parts) {
                String candidate = part.path("text").asText("").trim();
                if (!candidate.isBlank()) { text = candidate; break; }
            }

            if (text.isBlank()) return PestControlAdvice.fallback();

            text = text.replaceAll("(?s)```json\\s*", "")
                       .replaceAll("```", "").trim();

            JsonNode json = objectMapper.readTree(text);
            return new PestControlAdvice(
                json.path("organicControl").asText("Consult a local agronomist."),
                json.path("chemicalControl").asText("Consult a local agronomist."),
                json.path("preventiveMeasures").asText("Monitor crops regularly."),
                json.path("cropImpact").asText("Impact unknown — consult an expert.")
            );

        } catch (Exception e) {
            log.warn("Gemini pest control advice failed: {}", e.getMessage());
            return PestControlAdvice.fallback();
        }
    }

    private String buildControlPrompt(InsectIdResult insect, String cropType) {
        return String.format("""
            You are an agricultural expert. A farmer found the following insect on or near their %s crop:

            - Scientific name : %s
            - Common name     : %s
            - Confidence      : %.0f%%
            - Order / Family  : %s / %s
            - Is crop pest    : %s
            - Danger tags     : %s
            - Role tags       : %s

            Provide crop protection advice in this JSON format ONLY
            (no preamble, no markdown, no code fences, just raw JSON):

            {
              "organicControl": "1-2 sentences on organic/biological control methods",
              "chemicalControl": "1-2 sentences on chemical pesticide options",
              "preventiveMeasures": "1-2 sentences on prevention",
              "cropImpact": "1 sentence describing what damage this insect causes to %s crops"
            }

            If the insect is beneficial (pollinator / predator), say so clearly in each field
            and advise against control measures.
            """,
            cropType,
            insect.scientificName(), insect.commonName(),
            insect.confidence() * 100,
            insect.order() != null ? insect.order() : "Unknown",
            insect.family() != null ? insect.family() : "Unknown",
            insect.isCropPest(),
            String.join(", ", insect.dangerTags()),
            String.join(", ", insect.roleTags()),
            cropType
        );
    }

    // ── Threat level ──────────────────────────────────────────

    private String determineThreatLevel(InsectIdResult insect) {
        if (!insect.isCropPest()) return "Beneficial";

        // Check danger tags
        for (String tag : insect.dangerTags()) {
            String lower = tag.toLowerCase();
            if (lower.contains("highly venomous") || lower.contains("disease transmission"))
                return "High";
        }

        for (String tag : insect.roleTags()) {
            String lower = tag.toLowerCase();
            if (lower.contains("agriculture or garden pest"))
                return "Medium";
            if (lower.contains("household pest") || lower.contains("wood destroying"))
                return "Low";
        }

        return "Low";
    }

    // ── Inner types ───────────────────────────────────────────

    private record InsectIdResult(
        String scientificName,
        String commonName,
        double confidence,
        String order,
        String family,
        String insectClass,
        String description,
        List<String> dangerTags,
        List<String> roleTags,
        boolean isCropPest
    ) {
        static InsectIdResult unknown() {
            return new InsectIdResult(
                "Unknown", "Unknown", 0.0,
                null, null, null,
                "Could not identify the insect. Please try a clearer image.",
                List.of(), List.of(), false
            );
        }
    }

    private record PestControlAdvice(
        String organicControl,
        String chemicalControl,
        String preventiveMeasures,
        String cropImpact
    ) {
        static PestControlAdvice fallback() {
            return new PestControlAdvice(
                "Consult a local agronomist for organic control options.",
                "Consult a local agronomist for chemical control options.",
                "Monitor crops regularly and maintain field hygiene.",
                "Potential crop damage — consult an expert for assessment."
            );
        }
    }

    // ── Public result type ────────────────────────────────────

    @lombok.Builder
    @lombok.Data
    public static class PestScanResult {
        private String       scientificName;
        private String       commonName;
        private Double       confidence;
        private String       taxonomyOrder;
        private String       taxonomyFamily;
        private String       taxonomyClass;
        private String       description;
        private List<String> dangerTags;
        private List<String> roleTags;
        private Boolean      isCropPest;
        private String       threatLevel;      // Beneficial / Low / Medium / High

        // Gemini-generated crop control advice
        private String organicControl;
        private String chemicalControl;
        private String preventiveMeasures;
        private String cropImpact;

        public static PestScanResult unknown() {
            return PestScanResult.builder()
                .scientificName("Unknown")
                .commonName("Unknown")
                .confidence(0.0)
                .description("Could not identify the insect.")
                .dangerTags(List.of())
                .roleTags(List.of())
                .isCropPest(false)
                .threatLevel("Unknown")
                .organicControl("Consult a local agronomist.")
                .chemicalControl("Consult a local agronomist.")
                .preventiveMeasures("Monitor crops regularly.")
                .cropImpact("Unknown impact.")
                .build();
        }
    }
}