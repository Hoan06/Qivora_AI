package project_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project_backend.model.dto.request.CreateFeedbackRequest;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.FeedbackResponse;
import project_backend.service.FeedbackService;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiDataResponse<FeedbackResponse>> createFeedback(
            @Valid @RequestBody CreateFeedbackRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Gửi feedback thành công.",
                feedbackService.createFeedback(request, authentication == null ? null : authentication.getName()),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }
}
