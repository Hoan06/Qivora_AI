package project_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private Integer score = 10;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Nhiều Question thuộc về một Quiz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    // Một Question có nhiều Answers lựa chọn
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}