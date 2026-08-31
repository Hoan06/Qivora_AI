package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer timeLimit;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Boolean isActive;
    private Boolean isDeleted;
    private String deletedReason;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    private Long creatorId;
    private String creatorUsername;
    private List<QuestionResponse> questions;
}
