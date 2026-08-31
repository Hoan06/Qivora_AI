package project_backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project_backend.model.entity.Feedback;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    @EntityGraph(attributePaths = {"user", "quiz"})
    List<Feedback> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"user", "quiz"})
    Optional<Feedback> findById(Long id);

    long countByIsRead(Boolean isRead);
}
