package project_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import project_backend.model.dto.request.SoftDeleteViolationQuizRequest;
import project_backend.model.dto.response.AdminStatisticsResponse;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.FeedbackResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.UserResponse;
import project_backend.service.AdminService;
import project_backend.service.FeedbackService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final FeedbackService feedbackService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiDataResponse<AdminStatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Lấy thống kê hệ thống thành công.",
                adminService.getStatistics(),
                null,
                HttpStatus.OK
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiDataResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Láº¥y danh sĂ¡ch user thĂ nh cĂ´ng.",
                adminService.getUsers(page, size),
                null,
                HttpStatus.OK
        ));
    }

    @PatchMapping("/users/{userId}/lock")
    public ResponseEntity<ApiDataResponse<UserResponse>> lockUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Khóa tài khoản thành công.",
                adminService.lockUser(userId, authentication.getName()),
                null,
                HttpStatus.OK
        ));
    }

    @PatchMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiDataResponse<UserResponse>> unlockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Mở khóa tài khoản thành công.",
                adminService.unlockUser(userId),
                null,
                HttpStatus.OK
        ));
    }

    @PatchMapping("/quizzes/{quizId}/violation")
    public ResponseEntity<Void> softDeleteViolationQuiz(
            @PathVariable Long quizId,
            @RequestBody(required = false) SoftDeleteViolationQuizRequest request
    ) {
        adminService.softDeleteViolationQuiz(quizId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feedback")
    public ResponseEntity<ApiDataResponse<List<FeedbackResponse>>> getAllFeedback() {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Lấy danh sách feedback thành công.",
                feedbackService.getAllFeedback(),
                null,
                HttpStatus.OK
        ));
    }

    @GetMapping("/feedback/{id}")
    public ResponseEntity<ApiDataResponse<FeedbackResponse>> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Lấy chi tiết feedback thành công.",
                feedbackService.getFeedbackById(id),
                null,
                HttpStatus.OK
        ));
    }

    @PatchMapping("/feedback/{id}/read")
    public ResponseEntity<ApiDataResponse<FeedbackResponse>> markFeedbackAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Đánh dấu feedback đã đọc thành công.",
                feedbackService.markAsRead(id),
                null,
                HttpStatus.OK
        ));
    }
}
