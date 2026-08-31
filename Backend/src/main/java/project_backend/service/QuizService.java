package project_backend.service;

import project_backend.model.dto.request.CreateQuizRequest;
import project_backend.model.dto.request.GenerateQuizRequest;
import project_backend.model.dto.request.UpdateQuizRequest;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.QuizManageDetailResponse;
import project_backend.model.dto.response.QuizResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.model.dto.response.QuizTakeResponse;

public interface QuizService {
    QuizResponse createManualQuiz(CreateQuizRequest request, String username);

    QuizResponse createQuizByAi(GenerateQuizRequest request, String username);

    QuizSummaryResponse findQuizSummaryById(Long id);

    QuizSummaryResponse findQuizSummaryByCode(String code);

    PageResponse<QuizSummaryResponse> findPublicQuizzes(int page, int size);

    PageResponse<QuizSummaryResponse> findMyQuizzes(String username, int page, int size);

    QuizManageDetailResponse getMyQuizManageDetail(Long id, String username);

    QuizTakeResponse getQuizForTaking(Long id);

    QuizResponse getQuizDetailForAdmin(Long id);

    QuizResponse updateQuiz(Long id, UpdateQuizRequest request, String username);

    void deleteQuiz(Long id, String username);
}
