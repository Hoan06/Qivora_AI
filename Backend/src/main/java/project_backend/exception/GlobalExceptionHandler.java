package project_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import project_backend.model.dto.response.ApiDataResponse;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleBadRequest(BadRequestException e) {
        return buildError(e.getMessage(), null, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleNotFound(NotFoundException e) {
        return buildError(e.getMessage(), null, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleForbidden(ForbiddenException e) {
        return buildError(e.getMessage(), null, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleConflict(ConflictException e) {
        return buildError(e.getMessage(), null, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(BadLoginException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleBadLogin(BadLoginException e) {
        return buildError(e.getMessage(), null, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({AccountLockedException.class, DisabledException.class})
    public ResponseEntity<ApiDataResponse<Object>> handleAccountLocked(Exception e) {
        return buildError(e.getMessage(), null, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleInvalidToken(InvalidTokenException e) {
        return buildError(e.getMessage(), null, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiDataResponse<Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();

        e.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return buildError("Dữ liệu không hợp lệ", errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiDataResponse<Object>> handleException(Exception e) {
        return buildError("Có lỗi xảy ra trong hệ thống", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ApiDataResponse<Object>> buildError(String message, Object errors, HttpStatus status) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                false,
                message,
                null,
                errors,
                status
        ), status);
    }
}
