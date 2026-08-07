package kr.ac.mju.linkit.handover;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class HandoverResponses {

    private HandoverResponses() {
    }

    public record Category(UUID id, String name) {
    }

    public record CategoryList(List<Category> items) {
    }

    public record Handover(
            UUID id,
            UUID categoryId,
            String title,
            String owner,
            String status,
            String summary,
            List<String> criticalNotes,
            List<String> recurringTasks,
            List<String> checklist,
            List<String> references,
            List<String> openQuestions,
            Instant updatedAt
    ) {
    }

    public record HandoverList(List<Handover> items) {
    }
}
