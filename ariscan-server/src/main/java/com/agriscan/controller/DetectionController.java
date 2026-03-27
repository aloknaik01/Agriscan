package com.agriscan.controller;

import com.agriscan.dto.response.AnalyticsDTO;
import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.DetectionDTO;
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

    // Analyze
    // POST /api/v1/detection/analyze
    @PostMapping(value = "/analyze",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DetectionDTO>> analyze(
            @RequestPart("image") MultipartFile image,
            @RequestParam(value = "cropType",
                          required = false,
                          defaultValue = "Unknown") String cropType
    ) throws Exception {
        DetectionDTO result = detectionService.analyze(image, cropType);
        return ResponseEntity.ok(
            ApiResponse.success("Analysis complete", result)
        );
    }

    
    // History
    // GET /api/v1/detection/history
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<DetectionDTO>>> history() {
        return ResponseEntity.ok(
            ApiResponse.success("History fetched", detectionService.getHistory())
        );
    }

    // GET /api/v1/detection/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DetectionDTO>> getOne(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("Detection fetched", detectionService.getById(id)));
    }

    // GET /api/v1/detection/{id}/report  for  PDF download
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
    
    // Search & Filter
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DetectionDTO>>> search(
            @RequestParam(required = false) String cropType,
            @RequestParam(required = false) String disease,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        List<DetectionDTO> results =
            detectionService.search(cropType, disease, from, to);
        return ResponseEntity.ok(
            ApiResponse.success("Search results fetched", results));
    }
    
    
    
     // GET /api/v1/detection/analytics
    
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> analytics() {
        return ResponseEntity.ok(
            ApiResponse.success("Analytics fetched", analyticsService.getAnalytics()));
    }
    
    

    
    //Delete single
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOne(
            @PathVariable Long id) {
        detectionService.deleteById(id);
        return ResponseEntity.ok(
            ApiResponse.success("Detection deleted", null));
    }
    
    //Delete all history
    
    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> deleteHistory() {
        detectionService.deleteAllHistory();
        return ResponseEntity.ok(
            ApiResponse.success("Scan history cleared", null));
    }
}