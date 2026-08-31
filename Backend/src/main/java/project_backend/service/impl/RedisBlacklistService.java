package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisBlacklistService {
    private static final String REDIS_KEY_PREFIX = "jwt_blacklist:";

    private final StringRedisTemplate redisTemplate;

    public void blacklistToken(String token, Long remainingTimeMillis) {
        if (remainingTimeMillis != null && remainingTimeMillis > 0) {
            String key = REDIS_KEY_PREFIX + token;
            redisTemplate.opsForValue().set(key, "true", remainingTimeMillis, TimeUnit.MILLISECONDS);
        }
    }

    public boolean isCheckBlacklist(String token) {
        String key = REDIS_KEY_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
