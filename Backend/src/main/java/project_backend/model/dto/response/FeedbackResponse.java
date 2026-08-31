package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;
import project_backend.model.enum_entity.FeedbackType;

import java.time.LocalDateTime;

@Data
@Builder
public class FeedbackResponse {
    private Long id;
    private FeedbackType type;
    private String content;
    private String senderName;
    private Boolean isRead;
    private LocalDateTime createdAt;

    private Long userId;
    private String username;
    private String userEmail;

    private Long quizId;
    private String quizTitle;
    private String quizCode;
}
