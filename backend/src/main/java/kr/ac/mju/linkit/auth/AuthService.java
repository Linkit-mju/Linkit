package kr.ac.mju.linkit.auth;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;
import kr.ac.mju.linkit.auth.AuthExceptions.DuplicateEmail;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidCredentials;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidMjuEmail;
import kr.ac.mju.linkit.auth.AuthExceptions.EmailNotVerified;
import kr.ac.mju.linkit.auth.AuthExceptions.WeakPassword;
import kr.ac.mju.linkit.auth.AuthRequests.Login;
import kr.ac.mju.linkit.auth.AuthRequests.SignUp;
import kr.ac.mju.linkit.user.User;
import kr.ac.mju.linkit.user.UserRepository;
import kr.ac.mju.linkit.user.UserStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Pattern LETTER = Pattern.compile("[A-Za-z]");
    private static final Pattern NUMBER = Pattern.compile("\\d");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final EmailVerificationService emailVerificationService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Clock clock,
            EmailVerificationService emailVerificationService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public User signUp(SignUp request) {
        String email = MjuEmail.normalize(request.email());
        validateMjuEmail(email);
        validatePassword(request.password());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmail();
        }

        Instant now = clock.instant();
        User user = new User(
                UUID.randomUUID(),
                email,
                request.name().trim(),
                passwordEncoder.encode(request.password()),
                UserStatus.PENDING_EMAIL_VERIFICATION,
                now,
                null,
                now,
                now
        );

        try {
            User saved = userRepository.saveAndFlush(user);
            emailVerificationService.issue(saved);
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateEmail();
        }
    }

    @Transactional(readOnly = true)
    public User authenticate(Login request) {
        String email = MjuEmail.normalize(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentials::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentials();
        }

        if (user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {
            throw new EmailNotVerified();
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidCredentials();
        }

        return user;
    }

    private void validateMjuEmail(String email) {
        if (!MjuEmail.isValid(email)) {
            throw new InvalidMjuEmail();
        }
    }

    private void validatePassword(String password) {
        if (!LETTER.matcher(password).find() || !NUMBER.matcher(password).find()) {
            throw new WeakPassword();
        }
    }
}
