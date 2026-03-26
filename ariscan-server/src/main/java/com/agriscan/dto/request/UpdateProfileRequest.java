package com.agriscan.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String region;
    private String state;
    private Double farmSize;
    private List<String> crops;
    private String language;
}