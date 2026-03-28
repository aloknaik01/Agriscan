package com.agriscan.service;

import com.agriscan.dto.response.DetectionDTO;
import com.agriscan.entity.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email notifications for scan results.
 * Spring Mail 
 * Sends asynchronously so it never blocks the API response.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:https://agriscan.app}")
    private String frontendUrl;

    // Scan result email

    @Async
    public void sendScanResultEmail(User user, DetectionDTO dto) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("AgriScan — Your Scan Results: " + dto.getDiseaseName());
            helper.setText(buildScanResultHtml(user, dto), true);

            mailSender.send(message);
            log.info("Scan result email sent to {}", user.getEmail());

        } catch (Exception e) {
            log.error("Failed to send scan result email to {}: {}",
                user.getEmail(), e.getMessage());
        }
    }

    //  Alert email (severe disease detected) 

    @Async
    public void sendSevereAlertEmail(User user, DetectionDTO dto) {
        if (!"Severe".equalsIgnoreCase(dto.getSeverity())) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("⚠️ AgriScan Alert — Severe Disease Detected on Your Crop!");
            helper.setText(buildAlertHtml(user, dto), true);

            mailSender.send(message);
            log.info("Severe alert email sent to {}", user.getEmail());

        } catch (Exception e) {
            log.error("Failed to send alert email to {}: {}",
                user.getEmail(), e.getMessage());
        }
    }

    // HTML builders

    private String buildScanResultHtml(User user, DetectionDTO dto) {
        String severityColor = switch (dto.getSeverity() != null
                ? dto.getSeverity().toLowerCase() : "unknown") {
            case "healthy"  -> "#22c55e";
            case "mild"     -> "#eab308";
            case "moderate" -> "#f97316";
            case "severe"   -> "#ef4444";
            default         -> "#6b7280";
        };

        String treatmentHtml = "";
        if (dto.getTreatment() != null) {
            var t = dto.getTreatment();
            treatmentHtml = """
                <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-top:16px;">
                  <h3 style="color:#166534;margin:0 0 8px 0;">Treatment Recommendations</h3>
                  <p><strong>Organic:</strong> %s</p>
                  <p><strong>Chemical:</strong> %s</p>
                  <p><strong>Dosage:</strong> %s</p>
                  <p><strong>Prevention:</strong> %s</p>
                </div>
                """.formatted(
                    safe(t.getOrganicRemedy()),
                    safe(t.getChemicalPesticide()),
                    safe(t.getPesticideDosage()),
                    safe(t.getPreventiveMeasures())
                );
        }

        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1f2937;">
              <div style="background:#166534;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="color:white;margin:0;">🌿 AgriScan</h1>
                <p style="color:#bbf7d0;margin:4px 0 0 0;">AI-Powered Plant Disease Detection</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
                <p>Hi <strong>%s</strong>,</p>
                <p>Your crop scan has been completed. Here are the results:</p>

                <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
                  <table style="width:100%%;border-collapse:collapse;">
                    <tr><td style="padding:6px 0;color:#6b7280;">Crop</td>
                        <td style="padding:6px 0;font-weight:bold;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Disease</td>
                        <td style="padding:6px 0;font-weight:bold;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Severity</td>
                        <td style="padding:6px 0;">
                          <span style="background:%s;color:white;padding:2px 10px;
                                border-radius:999px;font-size:13px;">%s</span>
                        </td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Health Score</td>
                        <td style="padding:6px 0;font-weight:bold;">%s / 100</td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Confidence</td>
                        <td style="padding:6px 0;font-weight:bold;">%.1f%%</td></tr>
                  </table>
                </div>

                %s

                <div style="text-align:center;margin-top:24px;">
                  <a href="%s/history" style="background:#166534;color:white;padding:12px 28px;
                     border-radius:8px;text-decoration:none;font-weight:bold;">
                    View Full Report
                  </a>
                </div>

                <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center;">
                  AgriScan — AI-Powered Plant Disease Detection<br/>
                  You're receiving this because you have an AgriScan account.
                </p>
              </div>
            </body>
            </html>
            """.formatted(
                user.getName(),
                safe(dto.getCropType()),
                safe(dto.getDiseaseName()),
                severityColor, safe(dto.getSeverity()),
                safe(str(dto.getHealthScore())),
                dto.getConfidence() != null ? dto.getConfidence() * 100 : 0.0,
                treatmentHtml,
                frontendUrl
            );
    }

    private String buildAlertHtml(User user, DetectionDTO dto) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1f2937;">
              <div style="background:#dc2626;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="color:white;margin:0;">⚠️ Severe Disease Alert</h1>
                <p style="color:#fecaca;margin:4px 0 0 0;">Immediate action recommended</p>
              </div>

              <div style="border:1px solid #fca5a5;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
                <p>Hi <strong>%s</strong>,</p>
                <p>A <strong>severe disease</strong> has been detected on your <strong>%s</strong> crop.
                   Immediate treatment is strongly recommended to prevent crop loss.</p>

                <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;margin:16px 0;">
                  <strong>%s</strong> detected with %.0f%% confidence.
                  Health Score: <strong>%s / 100</strong>
                </div>

                %s

                <div style="text-align:center;margin-top:24px;">
                  <a href="%s/history" style="background:#dc2626;color:white;padding:12px 28px;
                     border-radius:8px;text-decoration:none;font-weight:bold;">
                    View Details &amp; Treatment Plan
                  </a>
                </div>

                <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center;">
                  AgriScan — AI-Powered Plant Disease Detection
                </p>
              </div>
            </body>
            </html>
            """.formatted(
                user.getName(),
                safe(dto.getCropType()),
                safe(dto.getDiseaseName()),
                dto.getConfidence() != null ? dto.getConfidence() * 100 : 0.0,
                safe(str(dto.getHealthScore())),
                dto.getTreatment() != null ? """
                    <div style="background:#fff7ed;border-radius:8px;padding:16px;margin-top:16px;">
                      <h3 style="color:#9a3412;margin:0 0 8px 0;">Recommended Treatment</h3>
                      <p><strong>Organic:</strong> %s</p>
                      <p><strong>Chemical:</strong> %s</p>
                      <p><strong>Prevention:</strong> %s</p>
                    </div>""".formatted(
                        safe(dto.getTreatment().getOrganicRemedy()),
                        safe(dto.getTreatment().getChemicalPesticide()),
                        safe(dto.getTreatment().getPreventiveMeasures())
                    ) : "",
                frontendUrl
            );
    }

    private String safe(String v) { return v != null ? v : "N/A"; }
    private String str(Object v)  { return v != null ? v.toString() : "N/A"; }
}