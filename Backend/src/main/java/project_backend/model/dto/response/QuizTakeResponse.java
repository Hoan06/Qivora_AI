package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizTakeResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer timeLimit;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Boolean hasPassword;
    private List<QuestionTakeResponse> questions;
}
