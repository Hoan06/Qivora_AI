package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import project_backend.exception.BadRequestException;
import project_backend.exception.NotFoundException;
import project_backend.mapper.UserMapper;
import project_backend.model.dto.response.QuizAttemptAnswerResultResponse;
import project_backend.model.dto.response.QuizAttemptDetailResponse;
import project_backend.model.dto.response.QuizAttemptHistoryResponse;
import project_backend.model.dto.response.QuizAttemptQuestionResultResponse;
import project_backend.model.dto.response.RankingResponse;
import project_backend.model.dto.response.UserResponse;
import project_backend.model.entity.Answer;
import project_backend.model.entity.Question;
import project_backend.model.entity.QuizAttempt;
import project_backend.model.entity.User;
import project_backend.model.entity.UserAnswer;
import project_backend.model.enum_entity.QuizAttemptStatus;
import project_backend.repository.QuizAttemptRepository;
import project_backend.repository.UserRepository;
import project_backend.service.UserService;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        return userMapper.toResponse(getUserByUsername(username));
    }

    @Override
    @Transactional
    public UserResponse updateAvatar(String username, MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            throw new BadRequestException("Avatar không được để trống");
        }

        String contentType = avatar.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Avatar phải là file ảnh");
        }

        try {
            User user = getUserByUsername(username);
            user.setAvatar(cloudinaryService.uploadAvatar(avatar));
            return userMapper.toResponse(userRepository.save(user));
        } catch (IOException e) {
            throw new BadRequestException("Upload avatar thất bại");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptHistoryResponse> getMyAttemptHistory(String username) {
        return quizAttemptRepository.findByUser_UsernameOrderByStartedAtDesc(username)
                .stream()
                .map(attempt -> QuizAttemptHistoryResponse.builder()
                        .attemptId(attempt.getId())
                        .quizId(attempt.getQuiz().getId())
                        .quizCode(attempt.getQuiz().getCode())
                        .quizTitle(attempt.getQuiz().getTitle())
                        .startedAt(attempt.getStartedAt())
                        .completedAt(attempt.getCompletedAt())
                        .score(attempt.getScore())
                        .status(attempt.getStatus())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizAttemptDetailResponse getMyAttemptDetail(String username, Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findByIdAndUser_Username(attemptId, username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch sử làm bài"));

        List<UserAnswer> userAnswers = attempt.getUserAnswers() == null
                ? Collections.emptyList()
                : attempt.getUserAnswers();

        Map<Long, List<UserAnswer>> selectedAnswersByQuestionId = userAnswers.stream()
                .collect(Collectors.groupingBy(userAnswer -> userAnswer.getQuestion().getId()));

        List<QuizAttemptQuestionResultResponse> questions = attempt.getQuiz().getQuestions()
                .stream()
                .map(question -> toQuestionResult(
                        question,
                        selectedAnswersByQuestionId.getOrDefault(question.getId(), Collections.emptyList())
                ))
                .toList();

        int totalAnswered = (int) questions.stream()
                .filter(question -> question.getAnswers().stream()
                        .anyMatch(QuizAttemptAnswerResultResponse::getIsSelected))
                .count();

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
                .totalQuestions(questions.size())
                .totalAnswered(totalAnswered)
                .correctQuestions(correctQuestions)
                .questions(questions)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RankingResponse> getTopRankings(int limit) {
        class RankingAccumulator {
            private final User user;
            private BigDecimal totalScore = BigDecimal.ZERO;
            private long totalAttempts = 0;

            private RankingAccumulator(User user) {
                this.user = user;
            }

            private void addScore(BigDecimal score) {
                totalScore = totalScore.add(score == null ? BigDecimal.ZERO : score);
                totalAttempts++;
            }

            private User user() {
                return user;
            }

            private BigDecimal totalScore() {
                return totalScore;
            }

            private long totalAttempts() {
                return totalAttempts;
            }
        }

        int safeLimit = Math.max(1, Math.min(limit, 100));
        Map<Long, RankingAccumulator> rankingByUserId = new HashMap<>();

        quizAttemptRepository.findRegisteredAttemptsByStatus(QuizAttemptStatus.COMPLETED)
                .forEach(attempt -> {
                    User user = attempt.getUser();
                    if (user == null) {
                        return;
                    }

                    RankingAccumulator accumulator = rankingByUserId.computeIfAbsent(
                            user.getId(),
                            userId -> new RankingAccumulator(user)
                    );
                    accumulator.addScore(attempt.getScore());
                });

        List<RankingAccumulator> sortedRankings = rankingByUserId.values()
                .stream()
                .sorted((left, right) -> {
                    int scoreCompare = right.totalScore().compareTo(left.totalScore());
                    if (scoreCompare != 0) {
                        return scoreCompare;
                    }

                    int attemptCompare = Long.compare(right.totalAttempts(), left.totalAttempts());
                    if (attemptCompare != 0) {
                        return attemptCompare;
                    }

                    return left.user().getUsername().compareToIgnoreCase(right.user().getUsername());
                })
                .toList();

        return java.util.stream.IntStream.range(0, Math.min(safeLimit, sortedRankings.size()))
                .mapToObj(index -> {
                    RankingAccumulator accumulator = sortedRankings.get(index);
                    User user = accumulator.user();

                    return RankingResponse.builder()
                            .rank(index + 1)
                            .userId(user.getId())
                            .username(user.getUsername())
                            .fullName(user.getFullName())
                            .avatar(user.getAvatar())
                            .totalScore(accumulator.totalScore())
                            .totalAttempts(accumulator.totalAttempts())
                            .build();
                })
                .toList();
    }

    private QuizAttemptQuestionResultResponse toQuestionResult(Question question, List<UserAnswer> selectedUserAnswers) {
        Set<Long> selectedAnswerIds = selectedUserAnswers.stream()
                .map(userAnswer -> userAnswer.getAnswer().getId())
                .collect(Collectors.toSet());

        Set<Long> correctAnswerIds = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .map(Answer::getId)
                .collect(Collectors.toSet());

        boolean isCorrect = !selectedAnswerIds.isEmpty() && selectedAnswerIds.equals(correctAnswerIds);

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
                                .isSelected(selectedAnswerIds.contains(answer.getId()))
                                .build())
                        .toList())
                .build();
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng hiện tại"));
    }
}
