package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuizSummaryResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer timeLimit;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Boolean isActive;
    private Boolean isDeleted;
    private Boolean hasPassword;
    private String creatorUsername;
    private String creatorFullName;
    private Integer totalQuestions;
    private Long totalAttempts;
}
