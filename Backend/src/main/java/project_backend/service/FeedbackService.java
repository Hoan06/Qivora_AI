package project_backend.service;

import project_backend.model.dto.request.CreateFeedbackRequest;
import project_backend.model.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse createFeedback(CreateFeedbackRequest request, String username);

    List<FeedbackResponse> getAllFeedback();

    FeedbackResponse getFeedbackById(Long id);

    FeedbackResponse markAsRead(Long id);
}
