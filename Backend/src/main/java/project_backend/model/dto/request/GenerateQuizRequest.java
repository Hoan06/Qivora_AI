package project_backend.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateQuizRequest {
    @NotBlank(message = "Chủ đề không được để trống")
    private String topic;

    private String description;

    private String difficulty = "Trung bình";

    @Min(value = 1, message = "Số lượng câu hỏi phải lớn hơn 0")
    @Max(value = 50, message = "Số lượng câu hỏi không được vượt quá 50")
    private Integer questionCount = 10;

    @Min(value = 2, message = "Mỗi câu hỏi phải có ít nhất 2 đáp án")
    @Max(value = 6, message = "Mỗi câu hỏi không được vượt quá 6 đáp án")
    private Integer answerCount = 4;

    @Min(value = 1, message = "Thời gian làm bài phải lớn hơn 0")
    private Integer timeLimit = 15;
}
