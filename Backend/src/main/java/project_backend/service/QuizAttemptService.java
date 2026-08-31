package project_backend.service;

import org.springframework.security.core.Authentication;
import project_backend.model.dto.request.StartQuizAttemptRequest;
import project_backend.model.dto.request.SubmitQuizRequest;
import project_backend.model.dto.response.QuizAttemptDetailResponse;
import project_backend.model.dto.response.StartQuizAttemptResponse;

public interface QuizAttemptService {
    StartQuizAttemptResponse startQuizById(Long quizId, StartQuizAttemptRequest request, Authentication authentication);

    StartQuizAttemptResponse startQuizByCode(String quizCode, StartQuizAttemptRequest request, Authentication authentication);

    QuizAttemptDetailResponse submitQuiz(Long attemptId, SubmitQuizRequest request, Authentication authentication);
}
