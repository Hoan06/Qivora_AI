package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;
import project_backend.model.enum_entity.QuizAttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizAttemptDetailResponse {
    private Long attemptId;
    private Long quizId;
    private String quizCode;
    private String quizTitle;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private BigDecimal score;
    private QuizAttemptStatus status;
    private Integer totalQuestions;
    private Integer totalAnswered;
    private Integer correctQuestions;
    private List<QuizAttemptQuestionResultResponse> questions;
}
