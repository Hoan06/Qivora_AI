package project_backend.model.dto.request;

import lombok.Data;

@Data
public class StartQuizAttemptRequest {
    private String password;
    private String guestName;
}
