package project_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import project_backend.model.dto.request.StartQuizAttemptRequest;
import project_backend.model.dto.request.SubmitQuizRequest;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.QuizAttemptDetailResponse;
import project_backend.model.dto.response.StartQuizAttemptResponse;
import project_backend.service.QuizAttemptService;

@RestController
@RequiredArgsConstructor
public class QuizAttemptController {
    private final QuizAttemptService quizAttemptService;

    @PostMapping("/api/v1/quizzes/{quizId}/start")
    public ResponseEntity<ApiDataResponse<StartQuizAttemptResponse>> startQuizById(
            @PathVariable Long quizId,
            @RequestBody(required = false) StartQuizAttemptRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Bắt đầu làm quiz thành công.",
                quizAttemptService.startQuizById(quizId, request, authentication),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping("/api/v1/quizzes/code/{quizCode}/start")
    public ResponseEntity<ApiDataResponse<StartQuizAttemptResponse>> startQuizByCode(
            @PathVariable String quizCode,
            @RequestBody(required = false) StartQuizAttemptRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Bắt đầu làm quiz thành công.",
                quizAttemptService.startQuizByCode(quizCode, request, authentication),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping("/api/v1/attempts/{attemptId}/submit")
    public ResponseEntity<ApiDataResponse<QuizAttemptDetailResponse>> submitQuiz(
            @PathVariable Long attemptId,
            @Valid @RequestBody SubmitQuizRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Nộp bài thành công.",
                quizAttemptService.submitQuiz(attemptId, request, authentication),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }
}
