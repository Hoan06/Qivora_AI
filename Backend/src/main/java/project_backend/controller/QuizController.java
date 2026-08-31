package project_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import project_backend.model.dto.request.CreateQuizRequest;
import project_backend.model.dto.request.GenerateQuizRequest;
import project_backend.model.dto.request.UpdateQuizRequest;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.QuizManageDetailResponse;
import project_backend.model.dto.response.QuizResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.model.dto.response.QuizTakeResponse;
import project_backend.service.QuizService;
import project_backend.service.ai.GenAiQuizGenerator;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final GenAiQuizGenerator genAiQuizGenerator;

    @GetMapping("/my")
    public ResponseEntity<ApiDataResponse<PageResponse<QuizSummaryResponse>>> findMyQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy danh sách quiz cá nhân thành công.",
                quizService.findMyQuizzes(authentication.getName(), page, size),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/my/{id}/manage")
    public ResponseEntity<ApiDataResponse<QuizManageDetailResponse>> getMyQuizManageDetail(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy thông tin quản lý quiz thành công.",
                quizService.getMyQuizManageDetail(id, authentication.getName()),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/public")
    public ResponseEntity<ApiDataResponse<PageResponse<QuizSummaryResponse>>> findPublicQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy danh sách quiz trong hệ thống thành công.",
                quizService.findPublicQuizzes(page, size),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDataResponse<QuizSummaryResponse>> findQuizById(@PathVariable Long id) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Tìm thấy quiz .",
                quizService.findQuizSummaryById(id),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiDataResponse<QuizSummaryResponse>> findQuizByCode(@PathVariable String code) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Tìm thấy quiz .",
                quizService.findQuizSummaryByCode(code),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/{id}/take")
    public ResponseEntity<ApiDataResponse<QuizTakeResponse>> getQuizForTaking(@PathVariable Long id) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy thông tin làm quiz thành công .",
                quizService.getQuizForTaking(id),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ApiDataResponse<QuizResponse>> createManualQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Tạo quiz thủ công thành công .",
                quizService.createManualQuiz(request, authentication.getName()),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @PostMapping("/ai")
    public ResponseEntity<ApiDataResponse<QuizResponse>> createQuizByAi(
            @Valid @RequestBody GenerateQuizRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Tạo quiz bằng AI thành công.",
                quizService.createQuizByAi(request, authentication.getName()),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @PostMapping("/ai/draft")
    public ResponseEntity<ApiDataResponse<CreateQuizRequest>> generateQuizDraftByAi(
            @Valid @RequestBody GenerateQuizRequest request
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "AI tạo bản nháp quiz thành công.",
                genAiQuizGenerator.generateQuiz(request),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiDataResponse<QuizResponse>> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuizRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật quiz thành công .",
                quizService.updateQuiz(id, request, authentication.getName()),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long id,
            Authentication authentication
    ) {
        quizService.deleteQuiz(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
