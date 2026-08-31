package project_backend.mapper;

import org.springframework.stereotype.Component;
import project_backend.model.dto.response.AnswerResponse;
import project_backend.model.dto.response.AnswerTakeResponse;
import project_backend.model.dto.response.QuestionResponse;
import project_backend.model.dto.response.QuestionTakeResponse;
import project_backend.model.dto.response.QuizResponse;
import project_backend.model.dto.response.QuizSummaryResponse;
import project_backend.model.dto.response.QuizTakeResponse;
import project_backend.model.entity.Answer;
import project_backend.model.entity.Question;
import project_backend.model.entity.Quiz;

@Component
public class QuizMapper {
    public QuizResponse toResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .code(quiz.getCode())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimit(quiz.getTimeLimit())
                .startedAt(quiz.getStartedAt())
                .endedAt(quiz.getEndedAt())
                .isActive(quiz.getIsActive())
                .isDeleted(quiz.getIsDeleted())
                .deletedReason(quiz.getDeletedReason())
                .deletedAt(quiz.getDeletedAt())
                .createdAt(quiz.getCreatedAt())
                .creatorId(quiz.getCreator().getId())
                .creatorUsername(quiz.getCreator().getUsername())
                .questions(quiz.getQuestions().stream().map(this::toQuestionResponse).toList())
                .build();
    }

    public QuizSummaryResponse toSummaryResponse(Quiz quiz) {
        return QuizSummaryResponse.builder()
                .id(quiz.getId())
                .code(quiz.getCode())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimit(quiz.getTimeLimit())
                .startedAt(quiz.getStartedAt())
                .endedAt(quiz.getEndedAt())
                .isActive(quiz.getIsActive())
                .isDeleted(quiz.getIsDeleted())
                .hasPassword(quiz.getPassword() != null && !quiz.getPassword().isBlank())
                .creatorUsername(quiz.getCreator().getUsername())
                .creatorFullName(quiz.getCreator().getFullName())
                .totalQuestions(quiz.getQuestions() == null ? 0 : quiz.getQuestions().size())
                .build();
    }

    public QuizTakeResponse toTakeResponse(Quiz quiz) {
        return QuizTakeResponse.builder()
                .id(quiz.getId())
                .code(quiz.getCode())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimit(quiz.getTimeLimit())
                .startedAt(quiz.getStartedAt())
                .endedAt(quiz.getEndedAt())
                .hasPassword(quiz.getPassword() != null && !quiz.getPassword().isBlank())
                .questions(quiz.getQuestions().stream().map(this::toQuestionTakeResponse).toList())
                .build();
    }

    private QuestionResponse toQuestionResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .content(question.getContent())
                .score(question.getScore())
                .explanation(question.getExplanation())
                .createdAt(question.getCreatedAt())
                .answers(question.getAnswers().stream().map(this::toAnswerResponse).toList())
                .build();
    }

    private AnswerResponse toAnswerResponse(Answer answer) {
        return AnswerResponse.builder()
                .id(answer.getId())
                .content(answer.getContent())
                .isCorrect(answer.getIsCorrect())
                .build();
    }

    private QuestionTakeResponse toQuestionTakeResponse(Question question) {
        return QuestionTakeResponse.builder()
                .id(question.getId())
                .content(question.getContent())
                .score(question.getScore())
                .answers(question.getAnswers().stream().map(this::toAnswerTakeResponse).toList())
                .build();
    }

    private AnswerTakeResponse toAnswerTakeResponse(Answer answer) {
        return AnswerTakeResponse.builder()
                .id(answer.getId())
                .content(answer.getContent())
                .build();
    }
}
