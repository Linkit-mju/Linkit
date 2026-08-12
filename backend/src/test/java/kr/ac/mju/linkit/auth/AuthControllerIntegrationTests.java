package kr.ac.mju.linkit.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.HttpSession;
import kr.ac.mju.linkit.handover.HandoverCategoryRepository;
import kr.ac.mju.linkit.handover.HandoverRepository;
import kr.ac.mju.linkit.user.User;
import kr.ac.mju.linkit.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.mockito.ArgumentCaptor;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HandoverRepository handoverRepository;

    @Autowired
    private HandoverCategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @MockitoBean
    private VerificationEmailSender emailSender;

    @BeforeEach
    void cleanDatabase() {
        handoverRepository.deleteAll();
        categoryRepository.deleteAll();
        emailVerificationTokenRepository.deleteAll();
        userRepository.deleteAll();
        clearInvocations(emailSender);
    }

    @Test
    void signsUpWithNormalizedMjuEmailAndHashedPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sign-up")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpBody("  Student@MJU.AC.KR  ")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("student@mju.ac.kr"))
                .andExpect(jsonPath("$.name").value("홍길동"));

        User saved = userRepository.findByEmail("student@mju.ac.kr").orElseThrow();
        assertThat(saved.getPasswordHash()).isNotEqualTo("password1");
        assertThat(passwordEncoder.matches("password1", saved.getPasswordHash())).isTrue();
        assertThat(saved.getStatus()).isEqualTo(
                kr.ac.mju.linkit.user.UserStatus.PENDING_EMAIL_VERIFICATION
        );
        assertThat(saved.getEmailVerifiedAt()).isNull();
        verify(emailSender).sendVerificationEmail(
                eq("student@mju.ac.kr"),
                org.mockito.ArgumentMatchers.contains("/verify-email?token=")
        );
    }

    @Test
    void rejectsNonMjuEmail() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sign-up")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpBody("student@example.com")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MJU_EMAIL_REQUIRED"));
    }

    @Test
    void rejectsDuplicateEmailIgnoringCaseAndWhitespace() throws Exception {
        signUp("student@mju.ac.kr");

        mockMvc.perform(post("/api/v1/auth/sign-up")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpBody(" STUDENT@MJU.AC.KR ")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"));
    }

    @Test
    void logsInAndPersistsAuthenticationInSession() throws Exception {
        signUp("student@mju.ac.kr");
        confirmLatestVerification("student@mju.ac.kr");

        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "STUDENT@MJU.AC.KR",
                                  "password": "password1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("student@mju.ac.kr"))
                .andReturn();

        HttpSession session = login.getRequest().getSession(false);
        assertThat(session).isNotNull();

        mockMvc.perform(get("/api/v1/auth/me").session(
                        (org.springframework.mock.web.MockHttpSession) session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("홍길동"));
    }

    @Test
    void rejectsInvalidPasswordWithoutRevealingWhichCredentialFailed()
            throws Exception {
        signUp("student@mju.ac.kr");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "student@mju.ac.kr",
                                  "password": "incorrect1"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message")
                        .value("이메일 또는 비밀번호가 올바르지 않습니다."));
    }

    @Test
    void blocksLoginUntilEmailIsVerified() throws Exception {
        signUp("pending@mju.ac.kr");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "pending@mju.ac.kr",
                                  "password": "password1"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("EMAIL_NOT_VERIFIED"));

        confirmLatestVerification("pending@mju.ac.kr");

        User verified = userRepository.findByEmail("pending@mju.ac.kr").orElseThrow();
        assertThat(verified.getStatus()).isEqualTo(
                kr.ac.mju.linkit.user.UserStatus.ACTIVE
        );
        assertThat(verified.getEmailVerifiedAt()).isNotNull();
    }

    @Test
    void rejectsInvalidEmailVerificationToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/email-verifications/confirm")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"not-a-valid-token"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code")
                        .value("INVALID_EMAIL_VERIFICATION_TOKEN"));
    }

    @Test
    void resendsVerificationWithoutRevealingAccountExistence() throws Exception {
        signUp("resend@mju.ac.kr");
        clearInvocations(emailSender);

        mockMvc.perform(post("/api/v1/auth/email-verifications/resend")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"resend@mju.ac.kr"}
                                """))
                .andExpect(status().isNoContent());
        verify(emailSender).sendVerificationEmail(
                eq("resend@mju.ac.kr"),
                org.mockito.ArgumentMatchers.contains("/verify-email?token=")
        );

        mockMvc.perform(post("/api/v1/auth/email-verifications/resend")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"missing@mju.ac.kr"}
                                """))
                .andExpect(status().isNoContent());
    }

    @Test
    void requiresCsrfTokenForStateChangingRequests() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpBody("student@mju.ac.kr")))
                .andExpect(status().isForbidden());
    }

    private void signUp(String email) throws Exception {
        mockMvc.perform(post("/api/v1/auth/sign-up")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpBody(email)))
                .andExpect(status().isCreated());
    }

    private void confirmLatestVerification(String email) throws Exception {
        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendVerificationEmail(eq(email), urlCaptor.capture());
        String query = URI.create(urlCaptor.getValue()).getRawQuery();
        String token = java.util.Arrays.stream(query.split("&"))
                .map(parameter -> parameter.split("=", 2))
                .filter(parts -> parts.length == 2 && parts[0].equals("token"))
                .map(parts -> URLDecoder.decode(parts[1], StandardCharsets.UTF_8))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(post("/api/v1/auth/email-verifications/confirm")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s"}
                                """.formatted(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    private String signUpBody(String email) {
        return """
                {
                  "name": "홍길동",
                  "email": "%s",
                  "password": "password1",
                  "termsAccepted": true
                }
                """.formatted(email);
    }
}
