package project_backend.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateQuizRequest {
    @NotBlank(message = "Tiêu đề quiz không được để trống")
    @Size(max = 200, message = "Tiêu đề quiz không được vượt quá 200 ký tự")
    private String title;

    private String description;

    @NotNull(message = "Thời gian làm bài không được để trống")
    @Min(value = 1, message = "Thời gian làm bài phải lớn hơn 0")
    private Integer timeLimit;

    @Size(max = 100, message = "Mật khẩu quiz không được vượt quá 100 ký tự")
    private String password;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @NotEmpty(message = "Quiz phải có ít nhất 1 câu hỏi")
    @Valid
    private List<CreateQuestionRequest> questions;
}
