package project_backend.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatisticsResponse {
    private long totalUsers;
    private long activeUsers;
    private long lockedUsers;
    private long totalAdmins;

    private long totalQuizzes;
    private long activeQuizzes;
    private long inactiveQuizzes;
    private long deletedQuizzes;

    private long totalAttempts;
    private long completedAttempts;
    private long inProgressAttempts;
    private long guestAttempts;
    private long registeredUserAttempts;

    private long totalFeedback;
    private long unreadFeedback;
}
