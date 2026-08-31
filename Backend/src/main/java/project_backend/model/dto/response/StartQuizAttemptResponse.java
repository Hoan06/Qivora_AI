package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StartQuizAttemptResponse {
    private Long attemptId;
    private QuizTakeResponse quiz;
}
