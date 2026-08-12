package kr.ac.mju.linkit.handover;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import kr.ac.mju.linkit.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class HandoverControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HandoverRepository handoverRepository;

    @Autowired
    private HandoverCategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        handoverRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createsListsAndUpdatesTheFullDocumentShape() throws Exception {
        MockHttpSession session = login("writer@mju.ac.kr");
        UUID categoryId = createCategory(session, "행사 및 기획");

        mockMvc.perform(get("/api/v1/handover-categories").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("행사 및 기획"));

        mockMvc.perform(patch("/api/v1/handover-categories/{categoryId}", categoryId)
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"행사 기획\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("행사 기획"));

        MvcResult created = mockMvc.perform(post("/api/v1/handovers")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoverBody(categoryId, "  ", "draft")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.owner").value("담당자 미정"))
                .andExpect(jsonPath("$.criticalNotes[0]").value("행사 8주 전 신청"))
                .andExpect(jsonPath("$.updatedAt").isString())
                .andReturn();
        UUID handoverId = id(created);

        mockMvc.perform(get("/api/v1/handovers").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(handoverId.toString()))
                .andExpect(jsonPath("$.items[0].summary").value("행사 운영 절차"))
                .andExpect(jsonPath("$.items[0].openQuestions[0]").value("우천 대안 확인"));

        mockMvc.perform(put("/api/v1/handovers/{handoverId}", handoverId)
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoverBody(categoryId, "기획국 김민지", "review")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("review"));

        mockMvc.perform(delete("/api/v1/handovers/{handoverId}", handoverId)
                        .session(session)
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void deletingCategoryDeletesItsHandovers() throws Exception {
        MockHttpSession session = login("owner@mju.ac.kr");
        UUID categoryId = createCategory(session, "회계 및 예산");
        createHandover(session, categoryId);

        mockMvc.perform(delete("/api/v1/handover-categories/{categoryId}", categoryId)
                        .session(session)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/handovers").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void hidesAnotherUsersHandover() throws Exception {
        MockHttpSession owner = login("owner@mju.ac.kr");
        UUID categoryId = createCategory(owner, "홍보");
        UUID handoverId = createHandover(owner, categoryId);
        MockHttpSession other = login("other@mju.ac.kr");

        mockMvc.perform(put("/api/v1/handovers/{handoverId}", handoverId)
                        .session(other)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoverBody(categoryId, "기획국 김민지", "review")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("HANDOVER_NOT_FOUND"));
    }

    @Test
    void requiresCsrfForCategoryMutation() throws Exception {
        MockHttpSession session = login("writer@mju.ac.kr");

        mockMvc.perform(post("/api/v1/handover-categories")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"행사\"}"))
                .andExpect(status().isForbidden());
    }

    private MockHttpSession login(String email) throws Exception {
        signUp(email);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"password1"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private void signUp(String email) throws Exception {
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
    }

    private UUID createCategory(MockHttpSession session, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/handover-categories")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\"}".formatted(name)))
                .andExpect(status().isCreated())
                .andReturn();
        return id(result);
    }

    private UUID createHandover(MockHttpSession session, UUID categoryId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/handovers")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoverBody(categoryId, "기획국 김민지", "draft")))
                .andExpect(status().isCreated())
                .andReturn();
        return id(result);
    }

    private UUID id(MvcResult result) throws Exception {
        String location = result.getResponse().getHeader("Location");
        return UUID.fromString(location.substring(location.lastIndexOf('/') + 1));
    }

    private String handoverBody(UUID categoryId, String owner, String status) {
        return """
                {
                  "categoryId":"%s",
                  "title":"대동제 운영 인수인계",
                  "owner":"%s",
                  "status":"%s",
                  "summary":"행사 운영 절차",
                  "criticalNotes":["행사 8주 전 신청"],
                  "recurringTasks":["D-60 장소 확정"],
                  "checklist":["공문 제출"],
                  "references":["예산안"],
                  "openQuestions":["우천 대안 확인"]
                }
                """.formatted(categoryId, owner, status);
    }
}
