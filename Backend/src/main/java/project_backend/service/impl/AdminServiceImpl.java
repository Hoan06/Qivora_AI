package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project_backend.exception.BadRequestException;
import project_backend.exception.NotFoundException;
import project_backend.mapper.QuizMapper;
import project_backend.mapper.UserMapper;
import project_backend.model.dto.request.SoftDeleteViolationQuizRequest;
import project_backend.model.dto.response.AdminStatisticsResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.model.dto.response.UserResponse;
import project_backend.model.entity.Quiz;
import project_backend.model.entity.User;
import project_backend.model.enum_entity.QuizAttemptStatus;
import project_backend.repository.QuizAttemptRepository;
import project_backend.repository.QuizRepository;
import project_backend.repository.UserRepository;
import project_backend.repository.FeedbackRepository;
import project_backend.service.AdminService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserMapper userMapper;
    private final QuizMapper quizMapper;

    @Override
    @Transactional(readOnly = true)
    public AdminStatisticsResponse getStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);

        long totalQuizzes = quizRepository.count();
        long activeQuizzes = quizRepository.countByIsActiveAndIsDeleted(true, false);
        long inactiveQuizzes = quizRepository.countByIsActiveAndIsDeleted(false, false);
        long deletedQuizzes = quizRepository.countByIsDeleted(true);

        return AdminStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .lockedUsers(totalUsers - activeUsers)
                .totalAdmins(userRepository.countDistinctByRoles_Name("ADMIN"))
                .totalQuizzes(totalQuizzes)
                .activeQuizzes(activeQuizzes)
                .inactiveQuizzes(inactiveQuizzes)
                .deletedQuizzes(deletedQuizzes)
                .totalAttempts(quizAttemptRepository.count())
                .completedAttempts(quizAttemptRepository.countByStatus(QuizAttemptStatus.COMPLETED))
                .inProgressAttempts(quizAttemptRepository.countByStatus(QuizAttemptStatus.IN_PROGRESS))
                .guestAttempts(quizAttemptRepository.countByUserIsNull())
                .registeredUserAttempts(quizAttemptRepository.countByUserIsNotNull())
                .totalFeedback(feedbackRepository.count())
                .unreadFeedback(feedbackRepository.countByIsRead(false))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 24);

        Page<User> userPage = userRepository.findAll(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return PageResponse.<UserResponse>builder()
                .content(userPage.getContent().stream().map(userMapper::toResponse).toList())
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuizSummaryResponse> getQuizzes(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 24);

        Page<Quiz> quizPage = quizRepository.findAll(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return PageResponse.<QuizSummaryResponse>builder()
                .content(quizPage.getContent().stream().map(this::toAdminQuizSummary).toList())
                .page(quizPage.getNumber())
                .size(quizPage.getSize())
                .totalElements(quizPage.getTotalElements())
                .totalPages(quizPage.getTotalPages())
                .first(quizPage.isFirst())
                .last(quizPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public UserResponse lockUser(Long userId, String currentAdminUsername) {
        User user = getUser(userId);

        if (user.getUsername().equals(currentAdminUsername)) {
            throw new BadRequestException("Admin không thể tự khóa tài khoản của mình");
        }

        user.setIsActive(false);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse unlockUser(Long userId) {
        User user = getUser(userId);
        user.setIsActive(true);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void softDeleteViolationQuiz(Long quizId, SoftDeleteViolationQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + quizId));

        quiz.setIsDeleted(true);
        quiz.setDeletedReason(request == null ? null : request.getReason());
        quiz.setDeletedAt(LocalDateTime.now());
        quizRepository.save(quiz);
    }

    private QuizSummaryResponse toAdminQuizSummary(Quiz quiz) {
        QuizSummaryResponse response = quizMapper.toSummaryResponse(quiz);
        response.setTotalAttempts(quizAttemptRepository.countByQuiz_Id(quiz.getId()));
        return response;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với id: " + userId));
    }
}
