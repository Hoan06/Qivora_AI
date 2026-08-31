package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;
import project_backend.model.enum_entity.QuizAttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class QuizParticipantResultResponse {
    private Long attemptId;
    private String participantName;
    private String participantEmail;
    private Boolean guest;
    private BigDecimal score;
    private QuizAttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
