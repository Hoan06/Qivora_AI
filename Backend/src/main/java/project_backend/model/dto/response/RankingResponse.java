package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RankingResponse {
    private Integer rank;
    private Long userId;
    private String username;
    private String fullName;
    private String avatar;
    private BigDecimal totalScore;
    private Long totalAttempts;
}
