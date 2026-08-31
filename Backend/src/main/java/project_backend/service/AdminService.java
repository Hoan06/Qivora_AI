package project_backend.service;

import project_backend.model.dto.request.SoftDeleteViolationQuizRequest;
import project_backend.model.dto.response.AdminStatisticsResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.model.dto.response.UserResponse;

public interface AdminService {
    AdminStatisticsResponse getStatistics();

    PageResponse<UserResponse> getUsers(int page, int size);

    PageResponse<QuizSummaryResponse> getQuizzes(int page, int size);

    UserResponse lockUser(Long userId, String currentAdminUsername);

    UserResponse unlockUser(Long userId);

    void softDeleteViolationQuiz(Long quizId, SoftDeleteViolationQuizRequest request);
}
