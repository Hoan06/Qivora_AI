package project_backend.service;

import org.springframework.web.multipart.MultipartFile;
import project_backend.model.dto.response.QuizAttemptDetailResponse;
import project_backend.model.dto.response.QuizAttemptHistoryResponse;
import project_backend.model.dto.response.RankingResponse;
import project_backend.model.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUser(String username);

    UserResponse updateAvatar(String username, MultipartFile avatar);

    List<QuizAttemptHistoryResponse> getMyAttemptHistory(String username);

    QuizAttemptDetailResponse getMyAttemptDetail(String username, Long attemptId);

    List<RankingResponse> getTopRankings(int limit);
}
