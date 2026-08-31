package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizManageDetailResponse {
    private QuizSummaryResponse quiz;
    private List<QuizParticipantResultResponse> results;
}
