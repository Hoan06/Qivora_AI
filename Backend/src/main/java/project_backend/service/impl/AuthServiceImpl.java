package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project_backend.exception.AccountLockedException;
import project_backend.exception.BadLoginException;
import project_backend.exception.BadRequestException;
import project_backend.exception.ConflictException;
import project_backend.exception.InvalidTokenException;
import project_backend.mapper.UserMapper;
import project_backend.model.dto.request.ChangePasswordRequest;
import project_backend.model.dto.request.LoginRequest;
import project_backend.model.dto.request.RegisterRequest;
import project_backend.model.dto.response.LoginCookieResponse;
import project_backend.model.dto.response.UserResponse;
import project_backend.model.entity.RefreshToken;
import project_backend.model.entity.Role;
import project_backend.model.entity.User;
import project_backend.repository.RefreshTokenRepository;
import project_backend.repository.RoleRepository;
import project_backend.repository.UserRepository;
import project_backend.security.jwt.JWTProvider;
import project_backend.service.AuthService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private static final String DEFAULT_ROLE = "USER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTProvider jwtProvider;
    private final UserMapper userMapper;
    private final RedisBlacklistService redisBlacklistService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã tồn tại");
        }

        Role userRole = roleRepository.findByName(DEFAULT_ROLE)
                .orElseGet(() -> roleRepository.save(Role.builder().name(DEFAULT_ROLE).build()));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .isActive(true)
                .roles(Set.of(userRole))
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public LoginCookieResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadLoginException("Username hoặc mật khẩu không chính xác"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AccountLockedException("Tài khoản đã bị khóa, vui lòng liên hệ Admin");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadLoginException("Username hoặc mật khẩu không chính xác");
        }

        String accessToken = jwtProvider.generateToken(user.getUsername());
        String refreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        refreshTokenRepository.save(RefreshToken.builder()
                .tokenHash(hashToken(refreshToken))
                .expiresAt(jwtProvider.getExpirationDateFromRefreshToken(refreshToken))
                .revoked(false)
                .user(user)
                .build());

        return LoginCookieResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresIn(jwtProvider.getJwtExpired())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public String refreshToken(String refreshToken) {
        validateRefreshTokenPresent(refreshToken);
        if (redisBlacklistService.isCheckBlacklist(refreshToken)) {
            throw new InvalidTokenException("Refresh token đã bị vô hiệu hóa");
        }

        if (!jwtProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        RefreshToken savedRefreshToken = getSavedRefreshToken(refreshToken);
        if (savedRefreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            savedRefreshToken.setRevoked(true);
            refreshTokenRepository.save(savedRefreshToken);
            throw new InvalidTokenException("Refresh token đã hết hạn");
        }

        String username = jwtProvider.getUsernameFromRefreshToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidTokenException("Refresh token không hợp lệ"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AccountLockedException("Tài khoản đã bị khóa, vui lòng liên hệ Admin");
        }

        return jwtProvider.generateToken(user.getUsername());
    }

    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        validateRefreshTokenPresent(refreshToken);

        if (!jwtProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        revokeRefreshToken(refreshToken);

        if (accessToken != null && !accessToken.isBlank() && jwtProvider.validateToken(accessToken)) {
            redisBlacklistService.blacklistToken(
                    accessToken,
                    getRemainingTimeMillis(jwtProvider.getExpirationDateFromAccessToken(accessToken))
            );
        }

        redisBlacklistService.blacklistToken(
                refreshToken,
                getRemainingTimeMillis(jwtProvider.getExpirationDateFromRefreshToken(refreshToken))
        );
    }

    @Override
    @Transactional
    public void changePassword(String accessToken, String refreshToken, ChangePasswordRequest request) {
        validateAccessTokenPresent(accessToken);
        validateRefreshTokenPresent(refreshToken);
        if (!jwtProvider.validateToken(accessToken)) {
            throw new InvalidTokenException("Access token không hợp lệ hoặc đã hết hạn");
        }

        if (!jwtProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        if (redisBlacklistService.isCheckBlacklist(refreshToken)) {
            throw new InvalidTokenException("Refresh token đã bị vô hiệu hóa");
        }

        String username = jwtProvider.getUsernameFromToken(accessToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidTokenException("Access token không hợp lệ"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AccountLockedException("Tài khoản đã bị khóa, vui lòng liên hệ Admin");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu mới không khớp");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        revokeRefreshToken(refreshToken);

        redisBlacklistService.blacklistToken(
                accessToken,
                getRemainingTimeMillis(jwtProvider.getExpirationDateFromAccessToken(accessToken))
        );

        redisBlacklistService.blacklistToken(
                refreshToken,
                getRemainingTimeMillis(jwtProvider.getExpirationDateFromRefreshToken(refreshToken))
        );
    }

    private RefreshToken getSavedRefreshToken(String refreshToken) {
        return refreshTokenRepository.findByTokenHashAndRevokedFalse(hashToken(refreshToken))
                .orElseThrow(() -> new InvalidTokenException("Refresh token không hợp lệ hoặc đã bị thu hồi"));
    }

    private void revokeRefreshToken(String refreshToken) {
        RefreshToken savedRefreshToken = getSavedRefreshToken(refreshToken);
        savedRefreshToken.setRevoked(true);
        refreshTokenRepository.save(savedRefreshToken);
    }

    private void validateAccessTokenPresent(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new InvalidTokenException("Access token không được để trống");
        }
    }

    private void validateRefreshTokenPresent(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token không được để trống");
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new InvalidTokenException("Không thể xử lý refresh token");
        }
    }

    private Long getRemainingTimeMillis(LocalDateTime expirationTime) {
        if (expirationTime == null) {
            return 0L;
        }

        return Duration.between(LocalDateTime.now(), expirationTime).toMillis();
    }
}
