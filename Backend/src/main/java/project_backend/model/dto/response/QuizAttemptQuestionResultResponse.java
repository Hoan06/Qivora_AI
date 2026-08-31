package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizAttemptQuestionResultResponse {
    private Long questionId;
    private String content;
    private Integer score;
    private String explanation;
    private Boolean isCorrect;
    private List<QuizAttemptAnswerResultResponse> answers;
}
