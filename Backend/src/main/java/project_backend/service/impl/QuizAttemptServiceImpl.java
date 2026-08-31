package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project_backend.exception.BadRequestException;
import project_backend.exception.ForbiddenException;
import project_backend.exception.NotFoundException;
import project_backend.mapper.QuizMapper;
import project_backend.model.dto.request.StartQuizAttemptRequest;
import project_backend.model.dto.request.SubmitQuizRequest;
import project_backend.model.dto.response.QuizAttemptAnswerResultResponse;
import project_backend.model.dto.response.QuizAttemptDetailResponse;
import project_backend.model.dto.response.QuizAttemptQuestionResultResponse;
import project_backend.model.dto.response.StartQuizAttemptResponse;
import project_backend.model.entity.Answer;
import project_backend.model.entity.Question;
import project_backend.model.entity.Quiz;
import project_backend.model.entity.QuizAttempt;
import project_backend.model.entity.User;
import project_backend.model.entity.UserAnswer;
import project_backend.model.enum_entity.QuizAttemptStatus;
import project_backend.repository.QuizAttemptRepository;
import project_backend.repository.QuizRepository;
import project_backend.repository.UserRepository;
import project_backend.service.QuizAttemptService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizMapper quizMapper;

    @Override
    @Transactional
    public StartQuizAttemptResponse startQuizById(
            Long quizId,
            StartQuizAttemptRequest request,
            Authentication authentication
    ) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + quizId));
        return startQuiz(quiz, request, authentication);
    }

    @Override
    @Transactional
    public StartQuizAttemptResponse startQuizByCode(
            String quizCode,
            StartQuizAttemptRequest request,
            Authentication authentication
    ) {
        Quiz quiz = quizRepository.findByCodeIgnoreCase(quizCode)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với mã: " + quizCode));
        return startQuiz(quiz, request, authentication);
    }

    @Override
    @Transactional
    public QuizAttemptDetailResponse submitQuiz(
            Long attemptId,
            SubmitQuizRequest request,
            Authentication authentication
    ) {
        QuizAttempt attempt = quizAttemptRepository.findWithDetailById(attemptId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lượt làm quiz"));

        validateAttemptOwner(attempt, authentication);

        if (QuizAttemptStatus.COMPLETED.equals(attempt.getStatus())) {
            throw new BadRequestException("Lượt làm quiz này đã được nộp");
        }

        Quiz quiz = attempt.getQuiz();
        Map<Long, Long> selectedAnswerByQuestionId = request.getAnswers().stream()
                .collect(Collectors.toMap(
                        answer -> answer.getQuestionId(),
                        answer -> answer.getAnswerId(),
                        (oldValue, newValue) -> newValue
                ));

        List<UserAnswer> userAnswers = new ArrayList<>();
        BigDecimal totalScore = BigDecimal.ZERO;

        for (Question question : quiz.getQuestions()) {
            Long selectedAnswerId = selectedAnswerByQuestionId.get(question.getId());
            if (selectedAnswerId == null) {
                continue;
            }

            Answer selectedAnswer = question.getAnswers().stream()
                    .filter(answer -> answer.getId().equals(selectedAnswerId))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Đáp án không thuộc câu hỏi: " + question.getId()));

            userAnswers.add(UserAnswer.builder()
                    .quizAttempt(attempt)
                    .question(question)
                    .answer(selectedAnswer)
                    .build());

            if (Boolean.TRUE.equals(selectedAnswer.getIsCorrect())) {
                totalScore = totalScore.add(BigDecimal.valueOf(question.getScore()));
            }
        }

        if (attempt.getUserAnswers() == null) {
            attempt.setUserAnswers(new ArrayList<>());
        }

        attempt.getUserAnswers().clear();
        attempt.getUserAnswers().addAll(userAnswers);
        attempt.setScore(totalScore);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setStatus(QuizAttemptStatus.COMPLETED);

        return toAttemptDetailResponse(quizAttemptRepository.save(attempt));
    }

    private StartQuizAttemptResponse startQuiz(
            Quiz quiz,
            StartQuizAttemptRequest request,
            Authentication authentication
    ) {
        StartQuizAttemptRequest safeRequest = request == null ? new StartQuizAttemptRequest() : request;

        validateQuizCanTake(quiz);
        validateQuizPassword(quiz, safeRequest.getPassword());

        User user = resolveUser(authentication);
        if (user == null && (safeRequest.getGuestName() == null || safeRequest.getGuestName().isBlank())) {
            throw new BadRequestException("Vui lòng nhập tên khách để làm quiz");
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(user)
                .guestName(user == null ? safeRequest.getGuestName().trim() : null)
                .startedAt(LocalDateTime.now())
                .status(QuizAttemptStatus.IN_PROGRESS)
                .score(BigDecimal.ZERO)
                .userAnswers(new ArrayList<>())
                .build();

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        return StartQuizAttemptResponse.builder()
                .attemptId(savedAttempt.getId())
                .quiz(quizMapper.toTakeResponse(quiz))
                .build();
    }

    private void validateQuizCanTake(Quiz quiz) {
        if (Boolean.TRUE.equals(quiz.getIsDeleted())) {
            throw new NotFoundException("Không tìm thấy quiz");
        }

        if (!Boolean.TRUE.equals(quiz.getIsActive())) {
            throw new BadRequestException("Quiz hiện không hoạt động");
        }

        LocalDateTime now = LocalDateTime.now();
        if (quiz.getStartedAt() != null && now.isBefore(quiz.getStartedAt())) {
            throw new BadRequestException("Quiz chưa đến thời gian mở");
        }

        if (quiz.getEndedAt() != null && now.isAfter(quiz.getEndedAt())) {
            throw new BadRequestException("Quiz đã hết thời gian làm bài");
        }
    }

    private void validateQuizPassword(Quiz quiz, String password) {
        if (quiz.getPassword() == null || quiz.getPassword().isBlank()) {
            return;
        }

        if (password == null || password.isBlank()) {
            throw new BadRequestException("Quiz này cần mật khẩu");
        }

        if (!passwordEncoder.matches(password, quiz.getPassword())) {
            throw new BadRequestException("Mật khẩu quiz không đúng");
        }
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        if ("anonymousUser".equals(authentication.getName())) {
            return null;
        }

        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    private void validateAttemptOwner(QuizAttempt attempt, Authentication authentication) {
        User attemptUser = attempt.getUser();
        if (attemptUser == null) {
            return;
        }

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Bạn không có quyền nộp lượt làm này");
        }

        if (!attemptUser.getUsername().equals(authentication.getName())) {
            throw new ForbiddenException("Bạn không có quyền nộp lượt làm này");
        }
    }

    private QuizAttemptDetailResponse toAttemptDetailResponse(QuizAttempt attempt) {
        List<UserAnswer> selectedAnswers = attempt.getUserAnswers() == null
                ? Collections.emptyList()
                : attempt.getUserAnswers();

        Map<Long, Long> selectedAnswerByQuestionId = selectedAnswers.stream()
                .collect(Collectors.toMap(
                        userAnswer -> userAnswer.getQuestion().getId(),
                        userAnswer -> userAnswer.getAnswer().getId()
                ));

        List<QuizAttemptQuestionResultResponse> questions = attempt.getQuiz().getQuestions().stream()
                .map(question -> {
                    Long selectedAnswerId = selectedAnswerByQuestionId.get(question.getId());
                    boolean isCorrect = question.getAnswers().stream()
                            .anyMatch(answer -> answer.getId().equals(selectedAnswerId)
                                    && Boolean.TRUE.equals(answer.getIsCorrect()));

                    return QuizAttemptQuestionResultResponse.builder()
                            .questionId(question.getId())
                            .content(question.getContent())
                            .score(question.getScore())
                            .explanation(question.getExplanation())
                            .isCorrect(isCorrect)
                            .answers(question.getAnswers().stream()
                                    .map(answer -> QuizAttemptAnswerResultResponse.builder()
                                            .answerId(answer.getId())
                                            .content(answer.getContent())
                                            .isCorrect(answer.getIsCorrect())
                                            .isSelected(answer.getId().equals(selectedAnswerId))
                                            .build())
                                    .toList())
                            .build();
                })
                .toList();

        int correctQuestions = (int) questions.stream()
                .filter(QuizAttemptQuestionResultResponse::getIsCorrect)
                .count();

        return QuizAttemptDetailResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizCode(attempt.getQuiz().getCode())
                .quizTitle(attempt.getQuiz().getTitle())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .score(attempt.getScore())
                .status(attempt.getStatus())
                .totalQuestions(attempt.getQuiz().getQuestions().size())
                .totalAnswered(selectedAnswers.size())
                .correctQuestions(correctQuestions)
                .questions(questions)
                .build();
    }
}
