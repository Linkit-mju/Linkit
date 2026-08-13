package kr.ac.mju.linkit.auth;

public final class AuthExceptions {

    private AuthExceptions() {
    }

    public static final class InvalidMjuEmail extends RuntimeException {
        public InvalidMjuEmail() {
            super("명지대학교 이메일(@mju.ac.kr)만 사용할 수 있습니다.");
        }
    }

    public static final class WeakPassword extends RuntimeException {
        public WeakPassword() {
            super("비밀번호는 영문과 숫자를 각각 하나 이상 포함해야 합니다.");
        }
    }

    public static final class DuplicateEmail extends RuntimeException {
        public DuplicateEmail() {
            super("이미 가입된 이메일입니다.");
        }
    }

    public static final class InvalidCredentials extends RuntimeException {
        public InvalidCredentials() {
            super("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    public static final class EmailNotVerified extends RuntimeException {
        public EmailNotVerified() {
            super("학교 이메일 인증이 필요합니다.");
        }
    }

    public static final class InvalidEmailVerificationToken extends RuntimeException {
        public InvalidEmailVerificationToken() {
            super("유효하지 않거나 만료된 이메일 인증 링크입니다.");
        }
    }
}
