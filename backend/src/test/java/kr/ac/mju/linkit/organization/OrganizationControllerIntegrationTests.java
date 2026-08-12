package kr.ac.mju.linkit.organization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import kr.ac.mju.linkit.auth.VerificationEmailSender;
import kr.ac.mju.linkit.user.User;
import kr.ac.mju.linkit.user.UserRepository;
import java.time.Instant;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc
class OrganizationControllerIntegrationTests {

    private static final UUID SEEDED_ORGANIZATION_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000001");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private VerificationEmailSender emailSender;

    @BeforeEach
    void cleanMemberships() {
        membershipRepository.deleteAll();
        Organization organization = organizationRepository.findById(
                SEEDED_ORGANIZATION_ID
        ).orElseThrow();
        organization.updateName("명지대학교 총학생회", Instant.now());
        organizationRepository.saveAndFlush(organization);
    }

    @Test
    void joinsSeededOrganizationWithNormalizedInviteCode() throws Exception {
        MockHttpSession session = signUpAndLogin("member1@mju.ac.kr");

        mockMvc.perform(post("/api/v1/organizations/join")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"inviteCode":" link01 "}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("명지대학교 총학생회"));

        assertThat(membershipRepository.count()).isEqualTo(1);
    }

    @Test
    void rejectsUnknownInviteCode() throws Exception {
        MockHttpSession session = signUpAndLogin("member2@mju.ac.kr");

        mockMvc.perform(post("/api/v1/organizations/join")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"inviteCode":"NOPE00"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("INVALID_INVITE_CODE"))
                .andExpect(jsonPath("$.message").value("유효하지 않는 초대코드입니다"));
    }

    @Test
    void reportsAlreadyJoinedOrganization() throws Exception {
        MockHttpSession session = signUpAndLogin("member3@mju.ac.kr");
        join(session, "LINK01").andExpect(status().isCreated());

        join(session, "LINK01")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ORGANIZATION_ALREADY_JOINED"))
                .andExpect(jsonPath("$.message").value("이미 가입된 조직입니다"));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/v1/organizations/join")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"inviteCode":"LINK01"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deniesOrganizationReadAndUpdateWithoutMembership() throws Exception {
        MockHttpSession session = signUpAndLogin("member4@mju.ac.kr");

        mockMvc.perform(get("/api/v1/organizations/{organizationId}",
                        SEEDED_ORGANIZATION_ID)
                        .session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ORGANIZATION_ACCESS_DENIED"));

        mockMvc.perform(patch("/api/v1/organizations/{organizationId}",
                        SEEDED_ORGANIZATION_ID)
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"권한 없는 변경"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ORGANIZATION_ACCESS_DENIED"));

        assertThat(organizationRepository.findById(SEEDED_ORGANIZATION_ID)
                .orElseThrow()
                .getName()).isEqualTo("명지대학교 총학생회");
    }

    @Test
    void allowsOrganizationReadAndUpdateAfterInviteCodeJoin() throws Exception {
        MockHttpSession session = signUpAndLogin("member5@mju.ac.kr");
        join(session, "LINK01").andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/organizations/{organizationId}",
                        SEEDED_ORGANIZATION_ID)
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("명지대학교 총학생회"));

        mockMvc.perform(patch("/api/v1/organizations/{organizationId}",
                        SEEDED_ORGANIZATION_ID)
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"  명지대학교 총학생회 운영본부  "}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("명지대학교 총학생회 운영본부"));
    }

    private org.springframework.test.web.servlet.ResultActions join(
            MockHttpSession session,
            String inviteCode
    ) throws Exception {
        return mockMvc.perform(post("/api/v1/organizations/join")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"inviteCode":"%s"}
                        """.formatted(inviteCode)));
    }

    private MockHttpSession signUpAndLogin(String email) throws Exception {
        mockMvc.perform(post("/api/v1/auth/sign-up")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"홍길동",
                                  "email":"%s",
                                  "password":"password1",
                                  "termsAccepted":true
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();
        user.verifyEmail(Instant.now());
        userRepository.saveAndFlush(user);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"%s",
                                  "password":"password1"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
    }
}
