package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;
import project_backend.model.enum_entity.QuizAttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class QuizAttemptHistoryResponse {
    private Long attemptId;
    private Long quizId;
    private String quizCode;
    private String quizTitle;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private BigDecimal score;
    private QuizAttemptStatus status;
}
