package project_backend.service;

import project_backend.model.dto.request.ChangePasswordRequest;
import project_backend.model.dto.request.LoginRequest;
import project_backend.model.dto.request.RegisterRequest;
import project_backend.model.dto.response.LoginCookieResponse;
import project_backend.model.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);

    LoginCookieResponse login(LoginRequest request);

    String refreshToken(String refreshToken);

    void logout(String accessToken, String refreshToken);

    void changePassword(String accessToken, String refreshToken, ChangePasswordRequest request);
}
