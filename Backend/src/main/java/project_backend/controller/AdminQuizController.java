package project_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.QuizResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.service.AdminService;
import project_backend.service.QuizService;

@RestController
@RequestMapping("/api/v1/admin/quizzes")
@RequiredArgsConstructor
public class AdminQuizController {
    private final QuizService quizService;
    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiDataResponse<PageResponse<QuizSummaryResponse>>> getQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Láº¥y danh sĂ¡ch quiz thĂ nh cĂ´ng.",
                adminService.getQuizzes(page, size),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDataResponse<QuizResponse>> getQuizDetailForAdmin(@PathVariable Long id) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy chi tiết quiz thành công .",
                quizService.getQuizDetailForAdmin(id),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }
}
