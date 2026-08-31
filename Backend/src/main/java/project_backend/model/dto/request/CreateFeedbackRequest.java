package project_backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import project_backend.model.enum_entity.FeedbackType;

@Data
public class CreateFeedbackRequest {
    @NotNull(message = "Loại feedback không được để trống")
    private FeedbackType type;

    private Long quizId;

    @NotBlank(message = "Họ tên người gửi không được để trống")
    @Size(max = 100, message = "Họ tên người gửi không được vượt quá 100 ký tự")
    private String senderName;

    @NotBlank(message = "Nội dung feedback không được để trống")
    private String content;
}
