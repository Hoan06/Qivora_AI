package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project_backend.exception.BadRequestException;
import project_backend.exception.ForbiddenException;
import project_backend.exception.NotFoundException;
import project_backend.mapper.QuizMapper;
import project_backend.model.dto.request.CreateAnswerRequest;
import project_backend.model.dto.request.CreateQuestionRequest;
import project_backend.model.dto.request.CreateQuizRequest;
import project_backend.model.dto.request.GenerateQuizRequest;
import project_backend.model.dto.request.UpdateQuizRequest;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.dto.response.QuizManageDetailResponse;
import project_backend.model.dto.response.QuizParticipantResultResponse;
import project_backend.model.dto.response.QuizResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.model.dto.response.QuizTakeResponse;
import project_backend.model.entity.Answer;
import project_backend.model.entity.Question;
import project_backend.model.entity.Quiz;
import project_backend.model.entity.QuizAttempt;
import project_backend.model.entity.User;
import project_backend.model.enum_entity.QuizAttemptStatus;
import project_backend.repository.QuizAttemptRepository;
import project_backend.repository.QuizRepository;
import project_backend.repository.UserRepository;
import project_backend.service.QuizService;
import project_backend.service.ai.GenAiQuizGenerator;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    private static final String CODE_PREFIX = "QZ";
    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int RANDOM_CODE_LENGTH = 6;

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final QuizMapper quizMapper;
    private final PasswordEncoder passwordEncoder;
    private final GenAiQuizGenerator genAiQuizGenerator;

    @Override
    @Transactional
    public QuizResponse createManualQuiz(CreateQuizRequest request, String username) {
        validateQuizTime(request);
        validateQuestions(request.getQuestions());

        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản tạo quiz"));

        if (!Boolean.TRUE.equals(creator.getIsActive())) {
            throw new BadRequestException("Tài khoản đã bị khóa, không thể tạo quiz");
        }

        Quiz quiz = Quiz.builder()
                .code(generateUniqueCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .timeLimit(request.getTimeLimit())
                .password(encodeQuizPassword(request.getPassword()))
                .startedAt(request.getStartedAt())
                .endedAt(request.getEndedAt())
                .isActive(true)
                .creator(creator)
                .build();

        List<Question> questions = request.getQuestions().stream()
                .map(questionRequest -> toQuestion(questionRequest, quiz))
                .toList();

        quiz.setQuestions(questions);

        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    @Override
    @Transactional
    public QuizResponse createQuizByAi(GenerateQuizRequest request, String username) {
        CreateQuizRequest generatedQuiz = genAiQuizGenerator.generateQuiz(request);
        generatedQuiz.setTimeLimit(request.getTimeLimit());
        return createManualQuiz(generatedQuiz, username);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSummaryResponse findQuizSummaryById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + id));

        validateQuizNotDeleted(quiz, id);

        return quizMapper.toSummaryResponse(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSummaryResponse findQuizSummaryByCode(String code) {
        Quiz quiz = quizRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với mã: " + code));

        validateQuizNotDeleted(quiz, quiz.getId());

        return quizMapper.toSummaryResponse(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuizSummaryResponse> findPublicQuizzes(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 24);

        Page<Quiz> quizPage = quizRepository.findByIsActiveAndIsDeleted(
                true,
                false,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return PageResponse.<QuizSummaryResponse>builder()
                .content(quizPage.getContent().stream().map(quizMapper::toSummaryResponse).toList())
                .page(quizPage.getNumber())
                .size(quizPage.getSize())
                .totalElements(quizPage.getTotalElements())
                .totalPages(quizPage.getTotalPages())
                .first(quizPage.isFirst())
                .last(quizPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuizSummaryResponse> findMyQuizzes(String username, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 24);

        Page<Quiz> quizPage = quizRepository.findByCreator_UsernameAndIsDeleted(
                username,
                false,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return PageResponse.<QuizSummaryResponse>builder()
                .content(quizPage.getContent().stream().map(this::toSummaryWithAttemptCount).toList())
                .page(quizPage.getNumber())
                .size(quizPage.getSize())
                .totalElements(quizPage.getTotalElements())
                .totalPages(quizPage.getTotalPages())
                .first(quizPage.isFirst())
                .last(quizPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizManageDetailResponse getMyQuizManageDetail(Long id, String username) {
        Quiz quiz = quizRepository.findByIdAndCreator_Username(id, username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz của bạn với id: " + id));

        validateQuizNotDeleted(quiz, id);

        QuizSummaryResponse summary = toSummaryWithAttemptCount(quiz);
        List<QuizParticipantResultResponse> results = quizAttemptRepository.findByQuiz_IdOrderByStartedAtDesc(id)
                .stream()
                .filter(attempt -> QuizAttemptStatus.COMPLETED.equals(attempt.getStatus()))
                .map(this::toParticipantResult)
                .toList();

        return QuizManageDetailResponse.builder()
                .quiz(summary)
                .results(results)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizTakeResponse getQuizForTaking(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + id));

        validateQuizNotDeleted(quiz, id);

        if (!Boolean.TRUE.equals(quiz.getIsActive())) {
            throw new BadRequestException("Quiz hiện không hoạt động");
        }

        if (quiz.getPassword() != null && !quiz.getPassword().isBlank()) {
            throw new BadRequestException("Quiz này cần mật khẩu");
        }

        return quizMapper.toTakeResponse(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponse getQuizDetailForAdmin(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + id));

        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse updateQuiz(Long id, UpdateQuizRequest request, String username) {
        validateQuizTime(request);
        validateQuestions(request.getQuestions());

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + id));

        validateQuizNotDeleted(quiz, id);

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản hiện tại"));

        validateCanModifyQuiz(quiz, currentUser);

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPassword(encodeQuizPassword(request.getPassword()));
        quiz.setStartedAt(request.getStartedAt());
        quiz.setEndedAt(request.getEndedAt());
        quiz.setIsActive(request.getIsActive() == null ? true : request.getIsActive());

        quiz.getQuestions().clear();

        List<Question> questions = request.getQuestions().stream()
                .map(questionRequest -> toQuestion(questionRequest, quiz))
                .toList();

        quiz.getQuestions().addAll(questions);

        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    @Override
    @Transactional
    public void deleteQuiz(Long id, String username) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quiz với id: " + id));

        validateQuizNotDeleted(quiz, id);

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản hiện tại"));

        validateCanModifyQuiz(quiz, currentUser);

        quiz.setIsDeleted(true);
        quiz.setIsActive(false);
        quiz.setDeletedAt(LocalDateTime.now());
        quizRepository.save(quiz);
    }

    private Question toQuestion(CreateQuestionRequest request, Quiz quiz) {
        Question question = Question.builder()
                .content(request.getContent())
                .score(request.getScore())
                .explanation(request.getExplanation())
                .quiz(quiz)
                .build();

        List<Answer> answers = request.getAnswers().stream()
                .map(answerRequest -> toAnswer(answerRequest, question))
                .toList();

        question.setAnswers(answers);
        return question;
    }

    private Answer toAnswer(CreateAnswerRequest request, Question question) {
        return Answer.builder()
                .content(request.getContent())
                .isCorrect(request.getIsCorrect())
                .question(question)
                .build();
    }

    private void validateQuizTime(CreateQuizRequest request) {
        validateQuizTimeRange(request.getStartedAt(), request.getEndedAt());
    }

    private void validateQuizTime(UpdateQuizRequest request) {
        validateQuizTimeRange(request.getStartedAt(), request.getEndedAt());
    }

    private void validateQuizTimeRange(LocalDateTime startedAt, LocalDateTime endedAt) {
        if (startedAt != null && endedAt != null && !endedAt.isAfter(startedAt)) {
            throw new BadRequestException("Thời gian đóng quiz phải sau thời gian mở quiz");
        }
    }

    private void validateQuestions(List<CreateQuestionRequest> questions) {
        for (CreateQuestionRequest question : questions) {
            boolean hasCorrectAnswer = question.getAnswers().stream()
                    .anyMatch(answer -> Boolean.TRUE.equals(answer.getIsCorrect()));

            if (!hasCorrectAnswer) {
                throw new BadRequestException("Mỗi câu hỏi phải có ít nhất 1 đáp án đúng");
            }
        }
    }

    private void validateCanModifyQuiz(Quiz quiz, User currentUser) {
        boolean isOwner = quiz.getCreator().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa quiz này");
        }
    }

    private void validateQuizNotDeleted(Quiz quiz, Long id) {
        if (Boolean.TRUE.equals(quiz.getIsDeleted())) {
            throw new NotFoundException("Khong tim thay quiz voi id: " + id);
        }
    }

    private QuizSummaryResponse toSummaryWithAttemptCount(Quiz quiz) {
        QuizSummaryResponse response = quizMapper.toSummaryResponse(quiz);
        response.setTotalAttempts(quizAttemptRepository.countByQuiz_Id(quiz.getId()));
        return response;
    }

    private QuizParticipantResultResponse toParticipantResult(QuizAttempt attempt) {
        User user = attempt.getUser();
        String participantName = user == null
                ? attempt.getGuestName()
                : (user.getFullName() == null || user.getFullName().isBlank() ? user.getUsername() : user.getFullName());

        return QuizParticipantResultResponse.builder()
                .attemptId(attempt.getId())
                .participantName(participantName == null || participantName.isBlank() ? "Khách" : participantName)
                .participantEmail(user == null ? null : user.getEmail())
                .guest(user == null)
                .score(attempt.getScore())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .build();
    }

    private String encodeQuizPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            return null;
        }

        return passwordEncoder.encode(rawPassword);
    }

    private String generateUniqueCode() {
        String code;

        do {
            code = CODE_PREFIX + randomCode();
        } while (quizRepository.existsByCode(code));

        return code;
    }

    private String randomCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder builder = new StringBuilder(RANDOM_CODE_LENGTH);

        for (int i = 0; i < RANDOM_CODE_LENGTH; i++) {
            builder.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }

        return builder.toString();
    }
}
