package kr.ac.mju.linkit.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.HttpSession;
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

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
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
