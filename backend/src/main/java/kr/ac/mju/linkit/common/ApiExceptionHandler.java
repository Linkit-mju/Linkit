package kr.ac.mju.linkit.common;

import java.util.List;
import java.util.Map;
import kr.ac.mju.linkit.auth.AuthExceptions.DuplicateEmail;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidCredentials;
import kr.ac.mju.linkit.auth.AuthExceptions.EmailNotVerified;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidEmailVerificationToken;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidMjuEmail;
import kr.ac.mju.linkit.auth.AuthExceptions.WeakPassword;
import kr.ac.mju.linkit.handover.HandoverExceptions.CategoryNotFound;
import kr.ac.mju.linkit.handover.HandoverExceptions.HandoverNotFound;
import kr.ac.mju.linkit.handover.HandoverExceptions.InvalidStatus;
import kr.ac.mju.linkit.organization.OrganizationExceptions.AlreadyJoinedOrganization;
import kr.ac.mju.linkit.organization.OrganizationExceptions.InvalidInviteCode;
import kr.ac.mju.linkit.organization.OrganizationExceptions.OrganizationAccessDenied;
import kr.ac.mju.linkit.organizationchart.OrganizationChartException;
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

    @ExceptionHandler(CategoryNotFound.class)
    ResponseEntity<ApiError> categoryNotFound(CategoryNotFound exception) {
        return error(HttpStatus.NOT_FOUND, "HANDOVER_CATEGORY_NOT_FOUND", exception.getMessage());
    }

    @ExceptionHandler(HandoverNotFound.class)
    ResponseEntity<ApiError> handoverNotFound(HandoverNotFound exception) {
        return error(HttpStatus.NOT_FOUND, "HANDOVER_NOT_FOUND", exception.getMessage());
    }

    @ExceptionHandler(InvalidStatus.class)
    ResponseEntity<ApiError> invalidStatus(InvalidStatus exception) {
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", exception.getMessage());
    }

    @ExceptionHandler(EmailNotVerified.class)
    ResponseEntity<ApiError> emailNotVerified(EmailNotVerified exception) {
        return error(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED", exception.getMessage());
    }

    @ExceptionHandler(InvalidEmailVerificationToken.class)
    ResponseEntity<ApiError> invalidEmailVerificationToken(
            InvalidEmailVerificationToken exception
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "INVALID_EMAIL_VERIFICATION_TOKEN",
                exception.getMessage()
        );
    }

    @ExceptionHandler(InvalidInviteCode.class)
    ResponseEntity<ApiError> invalidInviteCode(InvalidInviteCode exception) {
        return error(HttpStatus.NOT_FOUND, "INVALID_INVITE_CODE", exception.getMessage());
    }

    @ExceptionHandler(AlreadyJoinedOrganization.class)
    ResponseEntity<ApiError> alreadyJoinedOrganization(
            AlreadyJoinedOrganization exception
    ) {
        return error(
                HttpStatus.CONFLICT,
                "ORGANIZATION_ALREADY_JOINED",
                exception.getMessage()
        );
    }

    @ExceptionHandler(OrganizationAccessDenied.class)
    ResponseEntity<ApiError> organizationAccessDenied(
            OrganizationAccessDenied exception
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                "ORGANIZATION_ACCESS_DENIED",
                exception.getMessage()
        );
    }

    @ExceptionHandler(OrganizationChartException.class)
    ResponseEntity<ApiError> organizationChart(OrganizationChartException exception) {
        HttpStatus status = exception.getCode().endsWith("NOT_FOUND")
                ? HttpStatus.NOT_FOUND
                : exception.getCode().contains("ACCESS") || exception.getCode().equals("ORGANIZATION_REQUIRED")
                ? HttpStatus.FORBIDDEN
                : HttpStatus.CONFLICT;
        return error(status, exception.getCode(), exception.getMessage());
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
