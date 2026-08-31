package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnswerTakeResponse {
    private Long id;
    private String content;
}
