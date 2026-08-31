package project_backend.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionRequest {
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String content;

    @NotNull(message = "Điểm câu hỏi không được để trống")
    @Min(value = 1, message = "Điểm câu hỏi phải lớn hơn 0")
    private Integer score;

    private String explanation;

    @NotEmpty(message = "Câu hỏi phải có ít nhất 2 đáp án")
    @Size(min = 2, message = "Câu hỏi phải có ít nhất 2 đáp án")
    @Valid
    private List<CreateAnswerRequest> answers;
}
