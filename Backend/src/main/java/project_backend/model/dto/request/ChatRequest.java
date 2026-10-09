package project_backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;

    @NotBlank(message = "Mã hội thoại không được để trống")
    private String conversationId;
}
