package project_backend.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitQuizAnswerRequest {
    @NotNull(message = "questionId không được để trống")
    private Long questionId;

    @NotNull(message = "answerId không được để trống")
    private Long answerId;
}
