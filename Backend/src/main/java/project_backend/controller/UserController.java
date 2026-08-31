package project_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.QuizAttemptDetailResponse;
import project_backend.model.dto.response.QuizAttemptHistoryResponse;
import project_backend.model.dto.response.RankingResponse;
import project_backend.model.dto.response.UserResponse;
import project_backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiDataResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy thông tin người dùng hiện tại thành công.",
                userService.getCurrentUser(authentication.getName()),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PatchMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiDataResponse<UserResponse>> updateAvatar(
            Authentication authentication,
            @RequestPart("avatar") MultipartFile avatar
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật avatar thành công.",
                userService.updateAvatar(authentication.getName(), avatar),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/me/attempts")
    public ResponseEntity<ApiDataResponse<List<QuizAttemptHistoryResponse>>> getMyAttemptHistory(Authentication authentication) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy lịch sử làm bài thành công.",
                userService.getMyAttemptHistory(authentication.getName()),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/rankings/top")
    public ResponseEntity<ApiDataResponse<List<RankingResponse>>> getTopRankings(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "3") int limit
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy bảng xếp hạng thành công.",
                userService.getTopRankings(limit),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/me/attempts/{attemptId}")
    public ResponseEntity<ApiDataResponse<QuizAttemptDetailResponse>> getMyAttemptDetail(
            Authentication authentication,
            @PathVariable Long attemptId
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy chi tiết kết quả làm bài thành công.",
                userService.getMyAttemptDetail(authentication.getName(), attemptId),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }
}
