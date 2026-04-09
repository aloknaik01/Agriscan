package com.agriscan.controller;

import com.agriscan.dto.response.AnalyticsDTO;
import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.DetectionDTO;
import com.agriscan.dto.response.PagedDetectionDTO;
import com.agriscan.service.AnalyticsService;
import com.agriscan.service.DetectionService;
import com.agriscan.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/detection")
@RequiredArgsConstructor
public class DetectionController {

    private final DetectionService detectionService;
    private final PdfReportService pdfReportService;
    private final AnalyticsService analyticsService;

    // ── POST /analyze ─────────────────────────────────────────
    @PostMapping(value = "/analyze",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DetectionDTO>> analyze(
            @RequestPart("image") MultipartFile image,
            @RequestParam(value = "cropType",
                          required = false,
                          defaultValue = "Unknown") String cropType
    ) throws Exception {
        DetectionDTO result = detectionService.analyze(image, cropType);
        return ResponseEntity.ok(ApiResponse.success("Analysis complete", result));
    }

    // ── GET /history  (paginated) ─────────────────────────────
    // Example: GET /api/v1/detection/history?page=0&size=10
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PagedDetectionDTO>> history(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("History fetched",
                detectionService.getHistory(page, size)));
    }

    // ── GET /{id} ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DetectionDTO>> getOne(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("Detection fetched",
                detectionService.getById(id)));
    }

    // ── GET /{id}/report  (PDF download) ─────────────────────
    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable Long id) throws Exception {
        DetectionDTO dto = detectionService.getById(id);
        byte[] pdf = pdfReportService.generateReport(dto);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=agriscan-report-" + id + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    // ── GET /search ───────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DetectionDTO>>> search(
            @RequestParam(required = false) String cropType,
            @RequestParam(required = false) String disease,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Search results fetched",
                detectionService.search(cropType, disease, from, to)));
    }

    // ── GET /analytics ────────────────────────────────────────
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> analytics() {
        return ResponseEntity.ok(
            ApiResponse.success("Analytics fetched",
                analyticsService.getAnalytics()));
    }

    // ── DELETE /{id} ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOne(
            @PathVariable Long id) {
        detectionService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Detection deleted", null));
    }

    // ── DELETE /history ───────────────────────────────────────
    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> deleteHistory() {
        detectionService.deleteAllHistory();
        return ResponseEntity.ok(ApiResponse.success("Scan history cleared", null));
    }
}