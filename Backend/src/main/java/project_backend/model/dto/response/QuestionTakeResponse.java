package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionTakeResponse {
    private Long id;
    private String content;
    private Integer score;
    private List<AnswerTakeResponse> answers;
}
