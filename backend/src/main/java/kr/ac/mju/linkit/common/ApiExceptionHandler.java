package kr.ac.mju.linkit.common;

import java.util.List;
import java.util.Map;
import kr.ac.mju.linkit.auth.AuthExceptions.DuplicateEmail;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidCredentials;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidMjuEmail;
import kr.ac.mju.linkit.auth.AuthExceptions.WeakPassword;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(InvalidMjuEmail.class)
    ResponseEntity<ApiError> invalidMjuEmail(InvalidMjuEmail exception) {
        return error(HttpStatus.BAD_REQUEST, "MJU_EMAIL_REQUIRED", exception.getMessage());
    }

    @ExceptionHandler(WeakPassword.class)
    ResponseEntity<ApiError> weakPassword(WeakPassword exception) {
        return error(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD", exception.getMessage());
    }

    @ExceptionHandler(DuplicateEmail.class)
    ResponseEntity<ApiError> duplicateEmail(DuplicateEmail exception) {
        return error(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", exception.getMessage());
    }

    @ExceptionHandler(InvalidCredentials.class)
    ResponseEntity<ApiError> invalidCredentials(InvalidCredentials exception) {
        return error(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception) {
        List<Map<String, String>> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .toList();
        return ResponseEntity.badRequest().body(
                new ApiError("VALIDATION_FAILED", "입력 내용을 확인해주세요.", fieldErrors)
        );
    }

    private Map<String, String> toFieldError(FieldError error) {
        return Map.of(
                "field", error.getField(),
                "message", error.getDefaultMessage() == null
                        ? "올바른 값을 입력해주세요."
                        : error.getDefaultMessage()
        );
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String code,
            String message
    ) {
        return ResponseEntity.status(status)
                .body(new ApiError(code, message, List.of()));
    }

    public record ApiError(
            String code,
            String message,
            List<Map<String, String>> fieldErrors
    ) {
    }
}
