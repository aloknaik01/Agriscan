package com.agriscan.dto.response;

import lombok.Data;

@Data
public class TreatmentDTO {
	 private Long    id;               // null when AI-generated (no DB row)
	    private String  organicRemedy;
	    private String  chemicalPesticide;
	    private String  pesticideDosage;
	    private String  preventiveMeasures;
	    private Boolean aiGenerated;    
}