package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project_backend.exception.BadRequestException;
import project_backend.exception.NotFoundException;
import project_backend.model.dto.request.CreateFeedbackRequest;
import project_backend.model.dto.response.FeedbackResponse;
import project_backend.model.entity.Feedback;
import project_backend.model.entity.Quiz;
import project_backend.model.entity.User;
import project_backend.model.enum_entity.FeedbackType;
import project_backend.repository.FeedbackRepository;
import project_backend.repository.QuizRepository;
import project_backend.repository.UserRepository;
import project_backend.service.FeedbackService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;

    @Override
    @Transactional
    public FeedbackResponse createFeedback(CreateFeedbackRequest request, String username) {
        User user = Optional.ofNullable(username)
                .flatMap(userRepository::findByUsername)
                .orElse(null);

        Quiz quiz = null;
        if (FeedbackType.QUIZ.equals(request.getType())) {
            if (request.getQuizId() == null) {
                throw new BadRequestException("Feedback về quiz phải có quizId");
            }

            quiz = quizRepository.findById(request.getQuizId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + request.getQuizId()));

            if (Boolean.TRUE.equals(quiz.getIsDeleted())) {
                throw new NotFoundException("Không tìm thấy quiz với id: " + request.getQuizId());
            }
        }

        Feedback feedback = Feedback.builder()
                .type(request.getType())
                .content(request.getContent())
                .senderName(request.getSenderName().trim())
                .isRead(false)
                .user(user)
                .quiz(quiz)
                .build();

        return toResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponse getFeedbackById(Long id) {
        return toResponse(getFeedback(id));
    }

    @Override
    @Transactional
    public FeedbackResponse markAsRead(Long id) {
        Feedback feedback = getFeedback(id);
        feedback.setIsRead(true);
        return toResponse(feedbackRepository.save(feedback));
    }

    private Feedback getFeedback(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy feedback với id: " + id));
    }

    private FeedbackResponse toResponse(Feedback feedback) {
        Quiz quiz = feedback.getQuiz();
        User user = feedback.getUser();

        return FeedbackResponse.builder()
                .id(feedback.getId())
                .type(feedback.getType())
                .content(feedback.getContent())
                .senderName(feedback.getSenderName())
                .isRead(feedback.getIsRead())
                .createdAt(feedback.getCreatedAt())
                .userId(user == null ? null : user.getId())
                .username(user == null ? null : user.getUsername())
                .userEmail(user == null ? null : user.getEmail())
                .quizId(quiz == null ? null : quiz.getId())
                .quizTitle(quiz == null ? null : quiz.getTitle())
                .quizCode(quiz == null ? null : quiz.getCode())
                .build();
    }
}
