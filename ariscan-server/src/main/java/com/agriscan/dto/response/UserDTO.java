package com.agriscan.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String region;
    private String state;
    private Double farmSize;
    private List<String> crops;
    private String language;
    private String role;
    private LocalDateTime createdAt;
}