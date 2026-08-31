package project_backend.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class AppAspect {
    @Around("execution(* project_backend.service.impl.*.*(..))")
    public Object loggingExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        Object result;
        try {
            result = joinPoint.proceed();

        } catch (Throwable throwable) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            log.error("Phương thức {} thất bại sau {} ms với lỗi: {}",
                    joinPoint.getSignature().getName(), executionTime, throwable.getMessage());

            throw throwable;
        }

        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        try {
            String emailUser = "Anonymous";
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                emailUser = SecurityContextHolder.getContext().getAuthentication().getName();
            }

            log.info("User: {} | Chức năng: {}() | Thời gian thực hiện: {} ms",
                    emailUser, joinPoint.getSignature().getName(), executionTime);

        } catch (Exception e) {
            log.error("Lỗi xảy ra khi ghi log AOP: {}", e.getMessage());
        }

        return result;
    }
}
