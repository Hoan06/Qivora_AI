package project_backend.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;

@Component
@Slf4j
public class JWTProvider {
    @Value("${jwt-secret}")
    private String jwtSecret;

    @Value("${jwt-expired}")
    private Long jwtExpired;

    @Value("${jwt-refresh-secret}")
    private String jwtRefreshSecret;

    @Value("${jwt-refresh-expired}")
    private Long jwtRefreshExpired;

    @Value("${jwt-reset-secret}")
    private String jwtResetSecret;

    public String generateToken(String username) {
        return generateJwt(username, jwtSecret, jwtExpired);
    }

    public String generateRefreshToken(String username) {
        return generateJwt(username, jwtRefreshSecret, jwtRefreshExpired);
    }

    private String generateJwt(String subject, String secret, Long expired) {
        try {
            Date today = new Date();
            Date expiredJWT = new Date(today.getTime() + expired);
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            return Jwts.builder()
                    .subject(subject)
                    .issuedAt(today)
                    .expiration(expiredJWT)
                    .signWith(key)
                    .compact();
        } catch (Exception e) {
            log.error("generateJwt", e);
            throw new RuntimeException(e);
        }
    }

    public Long getJwtExpired() {
        return jwtExpired / 1000;
    }

    public Long getJwtRefreshExpired() {
        return jwtRefreshExpired / 1000;
    }

    public boolean validateToken(String token) {
        return validateTokenWithSecret(token, jwtSecret);
    }

    public boolean validateRefreshToken(String token) {
        return validateTokenWithSecret(token, jwtRefreshSecret);
    }

    private boolean validateTokenWithSecret(String token, String secret) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (UnsupportedJwtException e) {
            log.warn("Hệ thống không hỗ trợ JWT: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("Chuỗi JWT đã hết hạn: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Chuỗi JWT sai định dạng: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("Sai chữ ký JWT: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("Chuỗi JWT rỗng hoặc null: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("Lỗi xác thực JWT chung: {}", e.getMessage());
        }
        return false;
    }

    public String getUsernameFromToken(String token) {
        return getSubjectFromToken(token, jwtSecret);
    }

    public String getUsernameFromRefreshToken(String token) {
        return getSubjectFromToken(token, jwtRefreshSecret);
    }

    private String getSubjectFromToken(String token, String secret) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getSubject();
        } catch (Exception e) {
            log.error("getSubjectFromToken error: ", e);
            return null;
        }
    }

    public LocalDateTime getExpirationDateFromToken(String token) {
        return getExpirationDateFromAccessToken(token);
    }

    public LocalDateTime getExpirationDateFromAccessToken(String token) {
        return getExpirationDateFromToken(token, jwtSecret);
    }

    public LocalDateTime getExpirationDateFromRefreshToken(String token) {
        return getExpirationDateFromToken(token, jwtRefreshSecret);
    }

    private LocalDateTime getExpirationDateFromToken(String token, String secret) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            Date expiredDate = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getExpiration();
            return expiredDate.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getExpiration().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception e) {
            log.error("getExpirationDateFromToken error: ", e);
            return null;
        }
    }

    public String generateResetPasswordToken(String email) {
        return generateJwt(email, jwtResetSecret, 5 * 60 * 1000L);
    }

    public boolean validateResetToken(String token) {
        return validateTokenWithSecret(token, jwtResetSecret);
    }

    public String getEmailFromResetToken(String token) {
        return getSubjectFromToken(token, jwtResetSecret);
    }
}
