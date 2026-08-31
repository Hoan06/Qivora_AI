package project_backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project_backend.model.dto.request.ChangePasswordRequest;
import project_backend.model.dto.request.LoginRequest;
import project_backend.model.dto.request.RegisterRequest;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.LoginCookieResponse;
import project_backend.model.dto.response.UserResponse;
import project_backend.security.jwt.JWTProvider;
import project_backend.service.AuthService;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JWTProvider jwtProvider;

    @PostMapping("/register")
    public ResponseEntity<ApiDataResponse<UserResponse>> registerUser(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đăng kí tài khoản " + request.getEmail() + " thành công .",
                authService.register(request),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiDataResponse<UserResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginCookieResponse loginResponse = authService.login(request);
        addAuthCookies(response, loginResponse.getAccessToken(), loginResponse.getRefreshToken());

        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đăng nhập tài khoản " + request.getUsername() + " thành công .",
                loginResponse.getUser(),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiDataResponse<Void>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        String accessToken = authService.refreshToken(refreshToken);
        addAccessCookie(response, accessToken);

        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Làm mới token thành công .",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiDataResponse<Void>> logout(
            @CookieValue(name = "accessToken", required = false) String accessToken,
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(accessToken, refreshToken);
        clearAuthCookies(response);

        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đăng xuất thành công .",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiDataResponse<String>> changePassword(
            @CookieValue(name = "accessToken", required = false) String accessToken,
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse response
    ) {
        authService.changePassword(accessToken, refreshToken, request);
        clearAuthCookies(response);

        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Đổi mật khẩu thành công .",
                "Change password success",
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    private void addAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        addAccessCookie(response, accessToken);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(Duration.ofSeconds(jwtProvider.getJwtRefreshExpired()))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void addAccessCookie(HttpServletResponse response, String accessToken) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofSeconds(jwtProvider.getJwtExpired()))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
    }

    private void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie clearAccessCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        ResponseCookie clearRefreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, clearAccessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie.toString());
    }
}
