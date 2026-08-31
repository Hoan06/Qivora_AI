package project_backend.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SubmitQuizRequest {
    @NotEmpty(message = "Danh sách câu trả lời không được để trống")
    @Valid
    private List<SubmitQuizAnswerRequest> answers;
}
