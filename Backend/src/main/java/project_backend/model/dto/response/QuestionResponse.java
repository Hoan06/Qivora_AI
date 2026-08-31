package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuestionResponse {
    private Long id;
    private String content;
    private Integer score;
    private String explanation;
    private LocalDateTime createdAt;
    private List<AnswerResponse> answers;
}
