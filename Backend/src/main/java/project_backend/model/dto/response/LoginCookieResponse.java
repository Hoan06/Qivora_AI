package project_backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LoginCookieResponse {
    private String accessToken;
    private String refreshToken;
    private Long accessTokenExpiresIn;
    private UserResponse user;
}
