package project_backend.model.dto.request;

import lombok.Data;

@Data
public class SoftDeleteViolationQuizRequest {
    private String reason;
}
