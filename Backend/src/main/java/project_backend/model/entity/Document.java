package project_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project_backend.model.enum_entity.DocumentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long id;
    @Column(name = "document_name")
    private String name;
    @Column(name = "file_type")
    private String fileType;
    @Column(name = "file_size")
    private Long fileSize;
    @Column(name = "file_hash")
    private String fileHash;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DocumentStatus status;
    @Column(name = "chunk_count")
    private Integer chunkCount;
    private Boolean is_active;
    private LocalDateTime created_at;
    private String link_document; // cloudinary

    @ManyToOne
    @JoinColumn(name = "user_id" , nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.created_at = LocalDateTime.now();
        if (this.status == null) this.status = DocumentStatus.PENDING;
        if (this.is_active == null) this.is_active = true;
    }

}
