package project_backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project_backend.model.enum_entity.DocumentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String name;
    private String fileType;
    private Long fileSize;
    private DocumentStatus status;
    private Integer chunkCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String linkDocument;
    private Long uploaderId;
    private String uploaderUsername;
}
