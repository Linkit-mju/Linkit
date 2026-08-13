package kr.ac.mju.linkit.handover;

import java.time.Clock;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import kr.ac.mju.linkit.handover.HandoverExceptions.CategoryNotFound;
import kr.ac.mju.linkit.handover.HandoverExceptions.HandoverNotFound;
import kr.ac.mju.linkit.handover.HandoverExceptions.InvalidStatus;
import kr.ac.mju.linkit.handover.HandoverRequests.Handover;
import kr.ac.mju.linkit.handover.HandoverResponses.HandoverList;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HandoverService {

    private static final Set<String> STATUSES = Set.of("draft", "review", "complete");

    private final HandoverRepository handoverRepository;
    private final HandoverCategoryRepository categoryRepository;
    private final Clock clock;

    public HandoverService(
            HandoverRepository handoverRepository,
            HandoverCategoryRepository categoryRepository,
            Clock clock
    ) {
        this.handoverRepository = handoverRepository;
        this.categoryRepository = categoryRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public HandoverList list(UUID ownerId) {
        return new HandoverList(handoverRepository.findAllByOwnerIdOrderByUpdatedAtDescIdAsc(ownerId)
                .stream()
                .map(this::response)
                .toList());
    }

    @Transactional
    public kr.ac.mju.linkit.handover.HandoverResponses.Handover create(
            UUID ownerId,
            Handover request
    ) {
        ensureCategory(ownerId, request.categoryId());
        kr.ac.mju.linkit.handover.Handover handover = new kr.ac.mju.linkit.handover.Handover(
                UUID.randomUUID(), ownerId, request.categoryId(), request.title().trim(),
                owner(request.owner()), status(request.status()), summary(request.summary()),
                lines(request.criticalNotes()), lines(request.recurringTasks()), lines(request.checklist()),
                lines(request.references()), lines(request.openQuestions()), clock.instant()
        );
        return response(handoverRepository.save(handover));
    }

    @Transactional
    public kr.ac.mju.linkit.handover.HandoverResponses.Handover update(
            UUID ownerId,
            UUID handoverId,
            Handover request
    ) {
        kr.ac.mju.linkit.handover.Handover handover = handoverRepository
                .findByIdAndOwnerId(handoverId, ownerId)
                .orElseThrow(HandoverNotFound::new);
        ensureCategory(ownerId, request.categoryId());
        handover.update(
                request.categoryId(), request.title().trim(), owner(request.owner()),
                status(request.status()), summary(request.summary()), lines(request.criticalNotes()),
                lines(request.recurringTasks()), lines(request.checklist()), lines(request.references()),
                lines(request.openQuestions()), clock.instant()
        );
        return response(handover);
    }

    @Transactional
    public void delete(UUID ownerId, UUID handoverId) {
        handoverRepository.delete(handoverRepository.findByIdAndOwnerId(handoverId, ownerId)
                .orElseThrow(HandoverNotFound::new));
    }

    private void ensureCategory(UUID ownerId, UUID categoryId) {
        if (categoryRepository.findByIdAndOwnerId(categoryId, ownerId).isEmpty()) {
            throw new CategoryNotFound();
        }
    }

    private String status(String value) {
        if (!STATUSES.contains(value)) {
            throw new InvalidStatus();
        }
        return value;
    }

    private String owner(String value) {
        return value == null || value.isBlank() ? "담당자 미정" : value.trim();
    }

    private String summary(String value) {
        return value == null ? "" : value.trim();
    }

    private String lines(List<String> values) {
        if (values == null) {
            return "";
        }
        return values.stream()
                .filter(value -> value != null)
                .flatMap(value -> Arrays.stream(value.split("\\R")))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(java.util.stream.Collectors.joining("\n"));
    }

    private List<String> lines(String value) {
        return value.isEmpty() ? List.of() : List.of(value.split("\\n"));
    }

    private kr.ac.mju.linkit.handover.HandoverResponses.Handover response(
            kr.ac.mju.linkit.handover.Handover handover
    ) {
        return new kr.ac.mju.linkit.handover.HandoverResponses.Handover(
                handover.getId(), handover.getCategoryId(), handover.getTitle(), handover.getOwner(),
                handover.getStatus(), handover.getSummary(), lines(handover.getCriticalNotes()),
                lines(handover.getRecurringTasks()), lines(handover.getChecklist()),
                lines(handover.getReferences()), lines(handover.getOpenQuestions()), handover.getUpdatedAt()
        );
    }
}
