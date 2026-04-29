package com.agriscan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Kindwise plant.id v3 service.
 *
 * Single API call with health=all returns:
 *   - Crop/plant identification  (result.classification.suggestions)
 *   - Disease detection          (result.disease.suggestions)
 *   - Treatment recommendations  (details.treatment.biological/chemical/prevention)
 *   - Disease description        (details.description)
 *   - is_healthy flag            (result.is_healthy.binary)
 *
 * Replaces the old PlantNetService entirely.
 * The result type is kept compatible (same field names) so DetectionService
 * needs only a one-line dependency swap.
 */
@Slf4j
@Service
public class KindwiseService {

    // plant.id v3 endpoint
    private static final String PLANT_ID_URL =
        "https://plant.id/api/v3/identification";

    @Value("${kindwise.plant-id-api-key}")
    private String plantIdApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Public entry point ────────────────────────────────────

    public KindwiseResult analyze(MultipartFile image) {
        try {
            byte[] imageBytes = image.getBytes();
            String base64     = Base64.getEncoder().encodeToString(imageBytes);

            return callPlantId(base64);

        } catch (Exception e) {
            log.error("Kindwise plant.id analysis failed: {}", e.getMessage());
            return KindwiseResult.unknown();
        }
    }

    // ── plant.id v3 call ──────────────────────────────────────

    /**
     * POST https://plant.id/api/v3/identification
     *   ?details=common_names,description,treatment,disease_description&health=all
     *
     * health=all  →  costs 2 credits per call but returns BOTH classification
     *                AND health assessment in a single round trip.
     */
    private KindwiseResult callPlantId(String base64Image) throws Exception {

        Map<String, Object> requestBody = Map.of(
            "images",         List.of(base64Image),
            "health",         "all",
            "similar_images", false
        );

        String responseBody = RestClient.create()
            .post()
            .uri(PLANT_ID_URL + "?details=common_names,description,treatment,symptoms,type&language=en")
            .header("Api-Key", plantIdApiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(requestBody)
            .retrieve()
            .body(String.class);

        log.debug("plant.id raw response: {}", responseBody);
        return parseResponse(responseBody);
    }

    // ── Response parser ───────────────────────────────────────

    private KindwiseResult parseResponse(String json) throws Exception {
        JsonNode root   = objectMapper.readTree(json);
        JsonNode result = root.path("result");

        // ── 1. Is it even a plant? ─────────────────────────────
        boolean isPlant = result.path("is_plant").path("binary").asBoolean(true);
        if (!isPlant) {
            log.warn("plant.id: image does not appear to contain a plant");
            return KindwiseResult.unknown();
        }

        // ── 2. Crop identification ─────────────────────────────
        String cropType = extractCropType(result);

        // ── 3. Is it healthy? ──────────────────────────────────
        boolean isHealthy = result.path("is_healthy").path("binary").asBoolean(false);
        double  isHealthyProb = result.path("is_healthy").path("probability").asDouble(0.5);

        if (isHealthy) {
            return KindwiseResult.builder()
                .cropType(cropType)
                .diseaseName("Healthy")
                .diseaseCategory("Healthy")
                .diseaseType("Healthy")
                .description("The plant appears healthy with no visible disease or pest damage.")
                .symptoms("No symptoms detected.")
                .confidence(isHealthyProb)
                .isHealthy(true)
                .organicRemedy("No treatment needed — continue regular care.")
                .chemicalPesticide("No chemical treatment required.")
                .preventiveMeasures("Maintain proper watering, fertilization, and crop rotation.")
                .treatmentFromApi(true)
                .build();
        }

        // ── 4. Disease detection ───────────────────────────────
        JsonNode diseaseSuggestions = result.path("disease").path("suggestions");
        if (diseaseSuggestions.isMissingNode() || diseaseSuggestions.isEmpty()) {
            // No disease found — treat as healthy
            return KindwiseResult.builder()
                .cropType(cropType)
                .diseaseName("Healthy")
                .diseaseCategory("Healthy")
                .diseaseType("Healthy")
                .description("No disease or pest detected.")
                .symptoms("No symptoms detected.")
                .confidence(0.1)
                .isHealthy(true)
                .organicRemedy("No treatment needed.")
                .chemicalPesticide("No chemical treatment required.")
                .preventiveMeasures("Monitor crops regularly.")
                .treatmentFromApi(true)
                .build();
        }

        JsonNode topDisease = diseaseSuggestions.get(0);
        return buildDiseaseResult(cropType, topDisease);
    }

    // ── Crop type extractor ───────────────────────────────────

    private String extractCropType(JsonNode result) {
        JsonNode classSuggestions = result.path("classification").path("suggestions");
        if (classSuggestions.isMissingNode() || classSuggestions.isEmpty()) {
            return "Unknown";
        }
        JsonNode top     = classSuggestions.get(0);
        JsonNode details = top.path("details");

        // Prefer common name
        JsonNode commonNames = details.path("common_names");
        if (!commonNames.isMissingNode() && commonNames.isArray() && commonNames.size() > 0) {
            return commonNames.get(0).asText("Unknown");
        }
        // Fall back to scientific name
        return top.path("name").asText("Unknown");
    }

    // ── Disease result builder ────────────────────────────────

    private KindwiseResult buildDiseaseResult(String cropType, JsonNode suggestion) {
        String diseaseName = suggestion.path("name").asText("Unknown Disease");
        double confidence  = suggestion.path("probability").asDouble(0.0);
        JsonNode details   = suggestion.path("details");

        // ── diseaseType: native from plant.id — Fungi/Bacteria/Virus/Pest/Abiotic
        // Fall back to keyword matching only when plant.id returns null/blank
        String diseaseType = textOrNull(details.path("type"));
        if (diseaseType == null) {
            diseaseType = deriveCategory(diseaseName, details);
        }

        // ── description
        String description = details.path("description").asText(null);
        if (description == null || description.isBlank()) {
            description = "Disease detected: " + diseaseName;
        }

        // ── symptoms (NEW) — visible signs the farmer can see on the plant
        String symptoms = textOrNull(details.path("symptoms"));
        if (symptoms == null) {
            symptoms = "Consult local agricultural extension for symptom details.";
        }

        // ── treatment from plant.id expert database
        String  organicRemedy     = null;
        String  chemicalPesticide = null;
        String  preventiveMeasures= null;
        boolean treatmentFromApi  = false;

        JsonNode treatment = details.path("treatment");
        if (!treatment.isMissingNode()) {
            organicRemedy      = textOrNull(treatment.path("biological"));
            chemicalPesticide  = textOrNull(treatment.path("chemical"));
            preventiveMeasures = textOrNull(treatment.path("prevention"));

            // At least prevention is always returned per docs
            if (preventiveMeasures != null) {
                treatmentFromApi = true;
            }
        }

        return KindwiseResult.builder()
            .cropType(cropType)
            .diseaseName(diseaseName)
            .diseaseCategory(diseaseType)   // keep category consistent with type
            .diseaseType(diseaseType)
            .description(description)
            .symptoms(symptoms)
            .confidence(confidence)
            .isHealthy(false)
            .organicRemedy(organicRemedy)
            .chemicalPesticide(chemicalPesticide)
            .preventiveMeasures(preventiveMeasures)
            .treatmentFromApi(treatmentFromApi)
            .build();
    }

    // ── Category inference ────────────────────────────────────

    private String deriveCategory(String diseaseName, JsonNode details) {
        // plant.id sometimes returns disease type info in common_names or classification
        JsonNode commonNames = details.path("common_names");
        if (!commonNames.isMissingNode() && commonNames.isArray()) {
            for (JsonNode cn : commonNames) {
                String name = cn.asText("").toLowerCase();
                if (name.contains("fungal") || name.contains("fungi")) return "Fungal";
                if (name.contains("bacterial"))                         return "Bacterial";
                if (name.contains("viral") || name.contains("virus"))  return "Viral";
                if (name.contains("pest") || name.contains("insect"))  return "Pest";
            }
        }

        // Keyword match on disease name
        if (diseaseName == null) return "Disease";
        String lower = diseaseName.toLowerCase();
        if (lower.contains("blight") || lower.contains("rust")
            || lower.contains("mildew") || lower.contains("mold")
            || lower.contains("fusarium") || lower.contains("alternaria")
            || lower.contains("scab")     || lower.contains("rot"))     return "Fungal";
        if (lower.contains("bacteria")   || lower.contains("canker")
            || lower.contains("wilt")    || lower.contains("spot"))     return "Bacterial";
        if (lower.contains("virus")      || lower.contains("mosaic")
            || lower.contains("yellowing"))                              return "Viral";
        if (lower.contains("aphid")      || lower.contains("mite")
            || lower.contains("hopper")  || lower.contains("thrip")
            || lower.contains("whitefly")|| lower.contains("caterpillar")
            || lower.contains("beetle")  || lower.contains("larva"))    return "Pest";
        if (lower.contains("deficiency") || lower.contains("nutrient")) return "Nutrient Deficiency";
        return "Disease";
    }

    // ── Helpers ───────────────────────────────────────────────

    private String textOrNull(JsonNode node) {
        if (node.isMissingNode() || node.isNull()) return null;
        String v = node.asText("").trim();
        return v.isBlank() ? null : v;
    }

    // ── Result type ───────────────────────────────────────────

    @lombok.Builder
    @lombok.Data
    public static class KindwiseResult {
        private String  cropType;
        private String  diseaseName;
        private String  diseaseCategory;
        private String  diseaseType;         // Fungi / Bacteria / Virus / Pest / Abiotic
        private String  description;
        private String  symptoms;            // visible symptom description
        private double  confidence;
        private boolean isHealthy;

        // Treatment fields returned directly from plant.id API
        private String  organicRemedy;
        private String  chemicalPesticide;
        private String  preventiveMeasures;
        private boolean treatmentFromApi;   // true → skip Gemini call

        public static KindwiseResult unknown() {
            return KindwiseResult.builder()
                .cropType("Unknown")
                .diseaseName("Unknown")
                .diseaseCategory("")
                .diseaseType("Unknown")
                .description("")
                .symptoms("")
                .confidence(0.0)
                .isHealthy(false)
                .organicRemedy(null)
                .chemicalPesticide(null)
                .preventiveMeasures(null)
                .treatmentFromApi(false)
                .build();
        }
    }
}