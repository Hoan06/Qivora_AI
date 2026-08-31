package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizAttemptAnswerResultResponse {
    private Long answerId;
    private String content;
    private Boolean isCorrect;
    private Boolean isSelected;
}
