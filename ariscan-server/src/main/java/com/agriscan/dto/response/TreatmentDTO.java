package com.agriscan.dto.response;

import lombok.Data;

@Data
public class TreatmentDTO {
    private Long id;
    private String organicRemedy;
    private String chemicalPesticide;
    private String pesticideDosage;
    private String preventiveMeasures;
}