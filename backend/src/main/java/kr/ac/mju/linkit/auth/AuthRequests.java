package kr.ac.mju.linkit.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthRequests {

    private AuthRequests() {
    }

    public record SignUp(
            @NotBlank(message = "이름을 입력해주세요.")
            @Size(max = 100, message = "이름은 100자 이하여야 합니다.")
            String name,

            @NotBlank(message = "이메일을 입력해주세요.")
            String email,

            @NotBlank(message = "비밀번호를 입력해주세요.")
            @Size(min = 8, max = 72, message = "비밀번호는 8자 이상 72자 이하여야 합니다.")
            String password,

            @AssertTrue(message = "필수 약관에 동의해주세요.")
            boolean termsAccepted
    ) {
    }

    public record Login(
            @NotBlank(message = "이메일을 입력해주세요.")
            String email,

            @NotBlank(message = "비밀번호를 입력해주세요.")
            String password
    ) {
    }

    public record ConfirmEmail(
            @NotBlank(message = "이메일 인증 토큰이 필요합니다.")
            String token
    ) {
    }

    public record ResendEmailVerification(
            @NotBlank(message = "이메일을 입력해주세요.")
            String email
    ) {
    }
}
