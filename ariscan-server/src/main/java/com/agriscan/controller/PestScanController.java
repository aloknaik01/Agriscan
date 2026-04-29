package com.agriscan.controller;

import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.PagedPestScanDTO;
import com.agriscan.dto.response.PestScanDTO;
import com.agriscan.service.PestScanManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Pest scan endpoints.
 *
 * POST /api/v1/pest/analyze                    → Upload insect image, get identification + control advice
 * GET  /api/v1/pest/history?page=0&size=10     → Paginated pest scan history
 * GET  /api/v1/pest/{id}                       → Single pest scan result
 * GET  /api/v1/pest/{id}/report                → PDF report for a pest scan
 * DELETE /api/v1/pest/{id}                     → Delete a pest scan
 * DELETE /api/v1/pest/history                  → Clear all pest scan history
 */
@RestController
@RequestMapping("/api/v1/pest")
@RequiredArgsConstructor
public class PestScanController {

    private final PestScanManagementService pestScanManagementService;

    // ── POST /analyze ─────────────────────────────────────────
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PestScanDTO>> analyze(
            @RequestPart("image") MultipartFile image,
            @RequestParam(value = "cropType", required = false,
                          defaultValue = "Unknown") String cropType
    ) throws Exception {
        PestScanDTO result = pestScanManagementService.analyze(image, cropType);
        return ResponseEntity.ok(ApiResponse.success("Pest scan complete", result));
    }

    // ── GET /history ──────────────────────────────────────────
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PagedPestScanDTO>> history(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Pest scan history fetched",
                pestScanManagementService.getHistory(page, size)));
    }

    // ── GET /{id} ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PestScanDTO>> getOne(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("Pest scan fetched",
                pestScanManagementService.getById(id)));
    }

    // ── GET /{id}/report ──────────────────────────────────────
    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable Long id) throws Exception {
        byte[] pdf = pestScanManagementService.generateReport(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=agriscan-pest-report-" + id + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    // ── DELETE /{id} ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOne(
            @PathVariable Long id) {
        pestScanManagementService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Pest scan deleted", null));
    }

    // ── DELETE /history ───────────────────────────────────────
    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> deleteHistory() {
        pestScanManagementService.deleteAllHistory();
        return ResponseEntity.ok(ApiResponse.success("Pest scan history cleared", null));
    }
}