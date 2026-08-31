package project_backend.service.ai.impl;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;
import project_backend.exception.BadRequestException;
import project_backend.model.dto.request.CreateQuizRequest;
import project_backend.model.dto.request.GenerateQuizRequest;
import project_backend.service.ai.GenAiQuizGenerator;

import java.util.Map;

@Service
public class GoogleGenAiQuizGenerator implements GenAiQuizGenerator {
    private final ChatClient chatClient;

    public GoogleGenAiQuizGenerator(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public CreateQuizRequest generateQuiz(GenerateQuizRequest request) {
        BeanOutputConverter<CreateQuizRequest> converter = new BeanOutputConverter<>(CreateQuizRequest.class);

        String promptMessage = """
                Bạn là một chuyên gia giáo dục và là hệ thống tạo quiz cho ứng dụng học tập.

                Hãy tạo một quiz trắc nghiệm theo yêu cầu sau:
                - Chủ đề: {topic}
                - Mô tả thêm: {description}
                - Độ khó: {difficulty}
                - Số câu hỏi: {questionCount}
                - Số đáp án mỗi câu: {answerCount}
                - Thời gian làm bài: {timeLimit} phút
                - Ngôn ngữ: Tiếng Việt

                Quy tắc bắt buộc:
                - Mỗi câu hỏi phải có đúng {answerCount} đáp án.
                - Mỗi câu hỏi phải có ít nhất 1 đáp án đúng.
                - Điểm mỗi câu hỏi là 1.
                - password, startedAt, endedAt để null.
                - Không trả markdown, không bọc ```json.
                - Chỉ trả về JSON hợp lệ theo schema sau:
                {format}
                - Không được để trống questions hoặc answers.
                """;

        PromptTemplate template = new PromptTemplate(promptMessage);
        Prompt prompt = template.create(Map.of(
                "topic", request.getTopic(),
                "description", request.getDescription() == null ? "" : request.getDescription(),
                "difficulty", request.getDifficulty() == null ? "Trung bình" : request.getDifficulty(),
                "questionCount", request.getQuestionCount() == null ? 10 : request.getQuestionCount(),
                "answerCount", request.getAnswerCount() == null ? 4 : request.getAnswerCount(),
                "timeLimit", request.getTimeLimit() == null ? 15 : request.getTimeLimit(),
                "format", converter.getFormat()
        ));

        try {
            String aiResponse = chatClient.prompt(prompt).call().content();
            CreateQuizRequest quiz = converter.convert(aiResponse);

            if (quiz == null || quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
                throw new BadRequestException("AI không thể tạo quiz hợp lệ");
            }

            return quiz;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("AI không thể tạo quiz hợp lệ");
        }
    }
}
