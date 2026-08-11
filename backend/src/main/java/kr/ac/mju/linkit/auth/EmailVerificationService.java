package kr.ac.mju.linkit.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import kr.ac.mju.linkit.auth.AuthExceptions.InvalidEmailVerificationToken;
import kr.ac.mju.linkit.user.User;
import kr.ac.mju.linkit.user.UserRepository;
import kr.ac.mju.linkit.user.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmailVerificationService {

    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final VerificationEmailSender emailSender;
    private final Clock clock;
    private final String frontendBaseUrl;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            VerificationEmailSender emailSender,
            Clock clock,
            @Value("${linkit.frontend-base-url}") String frontendBaseUrl
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailSender = emailSender;
        this.clock = clock;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public void issue(User user) {
        tokenRepository.deleteByUserId(user.getId());
        tokenRepository.flush();

        String rawToken = generateToken();
        Instant now = clock.instant();
        tokenRepository.saveAndFlush(new EmailVerificationToken(
                UUID.randomUUID(),
                user.getId(),
                hash(rawToken),
                now.plus(TOKEN_TTL),
                now
        ));

        String verificationUrl = frontendBaseUrl
                + "/verify-email?token="
                + rawToken;
        emailSender.sendVerificationEmail(user.getEmail(), verificationUrl);
    }

    @Transactional
    public void resend(String rawEmail) {
        String email = MjuEmail.normalize(rawEmail);
        userRepository.findByEmail(email)
                .filter(user -> user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION)
                .ifPresent(this::issue);
    }

    @Transactional
    public User confirm(String rawToken) {
        EmailVerificationToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(InvalidEmailVerificationToken::new);
        Instant now = clock.instant();
        if (!token.getExpiresAt().isAfter(now)) {
            tokenRepository.delete(token);
            throw new InvalidEmailVerificationToken();
        }

        User user = userRepository.findById(token.getUserId())
                .filter(found -> found.getStatus()
                        == UserStatus.PENDING_EMAIL_VERIFICATION)
                .orElseThrow(InvalidEmailVerificationToken::new);
        user.verifyEmail(now);
        tokenRepository.delete(token);
        return user;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailVerificationToken();
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(value.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
