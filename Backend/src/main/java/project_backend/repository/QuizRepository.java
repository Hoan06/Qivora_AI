package project_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project_backend.model.entity.Quiz;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    boolean existsByCode(String code);

    Optional<Quiz> findByCodeIgnoreCase(String code);

    Optional<Quiz> findByIdAndCreator_Username(Long id, String username);

    Page<Quiz> findByIsActiveAndIsDeleted(Boolean isActive, Boolean isDeleted, Pageable pageable);

    Page<Quiz> findByCreator_UsernameAndIsDeleted(String username, Boolean isDeleted, Pageable pageable);

    long countByIsActive(Boolean isActive);

    long countByIsDeleted(Boolean isDeleted);

    long countByIsActiveAndIsDeleted(Boolean isActive, Boolean isDeleted);
}
