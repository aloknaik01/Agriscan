package com.agriscan.controller;

import com.agriscan.dto.response.ApiResponse;
import com.agriscan.dto.response.DetectionDTO;
import com.agriscan.service.DetectionService;
import com.agriscan.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/detection")
@RequiredArgsConstructor
public class DetectionController {

    private final DetectionService detectionService;
    private final PdfReportService pdfReportService;

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
            ApiResponse.success("Detection fetched", detectionService.getById(id))
        );
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
}