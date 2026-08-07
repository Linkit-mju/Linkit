package kr.ac.mju.linkit.handover;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public final class HandoverRequests {

    private HandoverRequests() {
    }

    public record Category(@NotBlank(message = "카테고리 이름을 입력해주세요.") String name) {
    }

    public record Handover(
            @NotNull(message = "카테고리를 선택해주세요.") UUID categoryId,
            @NotBlank(message = "제목을 입력해주세요.") String title,
            String owner,
            @NotBlank(message = "상태를 선택해주세요.") String status,
            String summary,
            List<String> criticalNotes,
            List<String> recurringTasks,
            List<String> checklist,
            List<String> references,
            List<String> openQuestions
    ) {
    }
}
