package com.agriscan.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;


@Data
@Builder
public class PagedDetectionDTO {

    private List<DetectionDTO> content;

    private int  page;          // 0-based current page
    private int  size;          // items per page
    private long totalElements; // total rows matching query
    private int  totalPages;
    private boolean first;
    private boolean last;
}