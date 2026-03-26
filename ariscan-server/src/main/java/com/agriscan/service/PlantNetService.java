package com.agriscan.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlantNetService {

    @Value("${plantnet.api-key}")
    private String apiKey;

    @Value("${plantnet.base-url}")
    private String baseUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PlantNetResult analyze(MultipartFile image) {
        try {
            byte[] imageBytes = image.getBytes();
            String filename   = image.getOriginalFilename();

            String    cropName = identifyPlant(imageBytes, filename);
            DiseaseResult dis  = identifyDisease(imageBytes, filename);

            return PlantNetResult.builder()
                .cropType(cropName)
                .diseaseName(dis.name())
                .diseaseCategory(dis.category())
                .description(dis.description())
                .confidence(dis.confidence())
                .isHealthy(dis.confidence() < 0.2)
                .build();

        } catch (Exception e) {
            log.error("PlantNet analysis failed: {}", e.getMessage());
            return PlantNetResult.unknown();
        }
    }

    // ── 1. Identify crop/plant species ────────────────────────
    private String identifyPlant(byte[] imageBytes, String filename) {
        try {
            // organs=leaf tells PlantNet this is a leaf image
            String url = baseUrl + "/identify/all"
                + "?api-key=" + apiKey
                + "&organs=leaf&lang=en&nb-results=1";

            String response = postImage(url, imageBytes, filename);

            JsonNode root    = objectMapper.readTree(response);
            JsonNode results = root.path("results");
            if (results.isEmpty()) return "Unknown";

            JsonNode species     = results.get(0).path("species");
            JsonNode commonNames = species.path("commonNames");

            if (!commonNames.isEmpty()) {
                return commonNames.get(0).asText();
            }
            return species.path("scientificNameWithoutAuthor").asText("Unknown");

        } catch (Exception e) {
            log.warn("Plant identification failed: {}", e.getMessage());
            return "Unknown";
        }
    }

    // ── 2. Identify disease ───────────────────────────────────
    private DiseaseResult identifyDisease(byte[] imageBytes, String filename) {
        try {
            String url = baseUrl + "/diseases/identify"
                + "?api-key=" + apiKey
                + "&nb-results=1&lang=en&no-reject=true";

            String response = postImage(url, imageBytes, filename);
            log.debug("PlantNet disease raw response: {}", response);

            JsonNode root    = objectMapper.readTree(response);
            JsonNode results = root.path("results");

            if (results.isEmpty()) {
            	return new DiseaseResult("Healthy", "Healthy", "", 0.0);
            }

            JsonNode top = results.get(0);

            // "description" = human-readable disease name e.g. "Aphis sp."
            // "name"        = EPPO code e.g. "APHISP"
            String description = top.path("description").asText("");
            String eppoCode    = top.path("name").asText("Unknown");
            double confidence  = top.path("score").asDouble(0.0);

            // Use description if available, otherwise EPPO code
            String diseaseName = !description.isBlank() ? description : eppoCode;

            // Derive a simple category from the description
            // (disease API /identify does NOT return categories per result)
            String category = deriveCategory(diseaseName);

            return new DiseaseResult(diseaseName, description, category, confidence);

        } catch (Exception e) {
            log.warn("Disease identification failed: {}", e.getMessage());
            return new DiseaseResult("Unknown", "Unknown", "", 0.0);
        }
    }

    // ── Simple category inference from disease name ───────────
    private String deriveCategory(String diseaseName) {
        if (diseaseName == null) return "";
        String lower = diseaseName.toLowerCase();
        if (lower.contains("blight") || lower.contains("rust")
            || lower.contains("mildew") || lower.contains("mold")
            || lower.contains("fungus") || lower.contains("fusarium")
            || lower.contains("alternaria")) return "Fungal";
        if (lower.contains("bacteria") || lower.contains("canker")
            || lower.contains("wilt"))    return "Bacterial";
        if (lower.contains("virus") || lower.contains("mosaic")
            || lower.contains("yellowing")) return "Viral";
        if (lower.contains("aphid") || lower.contains("mite")
            || lower.contains("hopper") || lower.contains("thrip")
            || lower.contains("whitefly")) return "Pest";
        return "Disease";
    }

    // ── Shared HTTP post helper ───────────────────────────────
    private String postImage(String url, byte[] imageBytes, String filename) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("images", new NamedByteArrayResource(imageBytes, filename));

        return RestClient.create()
            .post().uri(url)
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .body(body)
            .retrieve()
            .body(String.class);
    }

    // ── Result types ──────────────────────────────────────────

    @lombok.Builder
    @lombok.Data
    public static class PlantNetResult {
        private String  cropType;
        private String  diseaseName;
        private String  diseaseCategory;
        private String  description;
        private double  confidence;
        private boolean isHealthy;

        public static PlantNetResult unknown() {
            return PlantNetResult.builder()
                .cropType("Unknown")
                .diseaseName("Unknown")
                .diseaseCategory("")
                .description("")
                .confidence(0.0)
                .isHealthy(false)
                .build();
        }
    }

    // name = human readable, eppoCode = EPPO code, category = derived, confidence = score
    private record DiseaseResult(
        String name, String description, String category, double confidence) {}

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;
        public NamedByteArrayResource(byte[] bytes, String filename) {
            super(bytes);
            this.filename = filename != null ? filename : "image.jpg";
        }
        @Override public String getFilename() { return filename; }
    }
}