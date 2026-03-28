package com.agriscan.controller;

import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.WeatherAdvisoryDTO;
import com.agriscan.service.WeatherAdvisoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 Weather + AI crop advisory endpoint.
 * GET /api/v1/weather/advisory?lat=20.29&lon=85.82&cropType=Rice
 */
@RestController
@RequestMapping("/api/v1/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherAdvisoryService weatherAdvisoryService;

    @GetMapping("/advisory")
    public ResponseEntity<ApiResponse<WeatherAdvisoryDTO>> getAdvisory(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "Unknown") String cropType
    ) {
        WeatherAdvisoryDTO result =
            weatherAdvisoryService.getAdvisory(lat, lon, cropType);
        return ResponseEntity.ok(
            ApiResponse.success("Weather advisory fetched", result));
    }
}