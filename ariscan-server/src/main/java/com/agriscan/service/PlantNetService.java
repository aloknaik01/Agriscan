package com.agriscan.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

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

    @Value("${plantnet.identify-path}")
    private String identifyPath;

    @Value("${plantnet.disease-path}")
    private String diseasePath;

    private final ObjectMapper objectMapper;

    public PlantNetResult analyze(MultipartFile image) {
        try {
            byte[] imageBytes = image.getBytes();
            String cropName   = identifyPlant(imageBytes, image.getOriginalFilename());
            DiseaseResult disease = identifyDisease(imageBytes, image.getOriginalFilename());

            return PlantNetResult.builder()
                .cropType(cropName)
                .diseaseName(disease.name())
                .diseaseCategory(disease.category())
                .confidence(disease.confidence())
                .isHealthy(disease.confidence() < 0.2)
                .build();

        } catch (Exception e) {
            log.error("PlantNet API call failed: {}", e.getMessage());
            return PlantNetResult.unknown();
        }
    }

    private String identifyPlant(byte[] imageBytes, String filename) {
        try {
            String url = baseUrl + identifyPath
                       + "?api-key=" + apiKey
                       + "&organs=leaf&lang=en&nb-results=1";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("images", new NamedByteArrayResource(imageBytes, filename));

            String response = RestClient.create()
                .post().uri(url)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);

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

    private DiseaseResult identifyDisease(byte[] imageBytes, String filename) {
        try {
            String url = baseUrl + diseasePath
                       + "?api-key=" + apiKey
                       + "&nb-results=1&lang=en";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("images", new NamedByteArrayResource(imageBytes, filename));

            String response = RestClient.create()
                .post().uri(url)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);

            JsonNode root    = objectMapper.readTree(response);
            JsonNode results = root.path("results");

            if (results.isEmpty()) {
                return new DiseaseResult("Healthy", "", 0.0);
            }

            JsonNode top      = results.get(0);
            String name       = top.path("label").asText("Unknown");
            double confidence = top.path("score").asDouble(0.0);
            JsonNode cats     = top.path("categories");
            String category   = cats.isEmpty() ? "" : cats.get(0).asText();

            return new DiseaseResult(name, category, confidence);

        } catch (Exception e) {
            log.warn("Disease identification failed: {}", e.getMessage());
            return new DiseaseResult("Unknown", "", 0.0);
        }
    }

    @lombok.Builder
    @lombok.Data
    public static class PlantNetResult {
        private String  cropType;
        private String  diseaseName;
        private String  diseaseCategory;
        private double  confidence;
        private boolean isHealthy;

        public static PlantNetResult unknown() {
            return PlantNetResult.builder()
                .cropType("Unknown")
                .diseaseName("Unknown")
                .diseaseCategory("")
                .confidence(0.0)
                .isHealthy(false)
                .build();
        }
    }

    private record DiseaseResult(String name, String category, double confidence) {}

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;
        public NamedByteArrayResource(byte[] bytes, String filename) {
            super(bytes);
            this.filename = filename != null ? filename : "image.jpg";
        }
        @Override public String getFilename() { return filename; }
    }
}