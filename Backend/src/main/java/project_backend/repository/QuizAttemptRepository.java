package project_backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project_backend.model.entity.QuizAttempt;
import project_backend.model.enum_entity.QuizAttemptStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    @EntityGraph(attributePaths = {"quiz"})
    List<QuizAttempt> findByUser_UsernameOrderByStartedAtDesc(String username);

    @EntityGraph(attributePaths = {
            "quiz",
            "userAnswers",
            "userAnswers.question",
            "userAnswers.answer"
    })
    Optional<QuizAttempt> findByIdAndUser_Username(Long id, String username);

    @EntityGraph(attributePaths = {
            "quiz",
            "user",
            "userAnswers",
            "userAnswers.question",
            "userAnswers.answer"
    })
    @Query("select attempt from QuizAttempt attempt where attempt.id = :id")
    Optional<QuizAttempt> findWithDetailById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"user"})
    List<QuizAttempt> findByQuiz_IdOrderByStartedAtDesc(Long quizId);

    long countByQuiz_Id(Long quizId);

    long countByStatus(QuizAttemptStatus status);

    long countByUserIsNull();

    long countByUserIsNotNull();

    @EntityGraph(attributePaths = {"user"})
    @Query("select attempt from QuizAttempt attempt where attempt.user is not null and attempt.status = :status")
    List<QuizAttempt> findRegisteredAttemptsByStatus(@Param("status") QuizAttemptStatus status);
}
