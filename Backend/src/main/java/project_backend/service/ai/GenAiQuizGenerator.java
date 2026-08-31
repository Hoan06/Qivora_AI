package project_backend.service.ai;

import project_backend.model.dto.request.CreateQuizRequest;
import project_backend.model.dto.request.GenerateQuizRequest;

public interface GenAiQuizGenerator {
    CreateQuizRequest generateQuiz(GenerateQuizRequest request);
}
