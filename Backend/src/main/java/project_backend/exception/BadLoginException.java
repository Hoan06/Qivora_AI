package project_backend.exception;

public class BadLoginException extends RuntimeException {
    public BadLoginException(String message) {
        super(message);
    }
}
