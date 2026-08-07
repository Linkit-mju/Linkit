package kr.ac.mju.linkit.handover;

import java.time.Clock;
import java.util.UUID;
import kr.ac.mju.linkit.handover.HandoverExceptions.CategoryNotFound;
import kr.ac.mju.linkit.handover.HandoverRequests.Category;
import kr.ac.mju.linkit.handover.HandoverResponses.CategoryList;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HandoverCategoryService {

    private final HandoverCategoryRepository categoryRepository;
    private final Clock clock;

    public HandoverCategoryService(HandoverCategoryRepository categoryRepository, Clock clock) {
        this.categoryRepository = categoryRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public CategoryList list(UUID ownerId) {
        return new CategoryList(categoryRepository.findAllByOwnerIdOrderByCreatedAtAscIdAsc(ownerId)
                .stream()
                .map(category -> new kr.ac.mju.linkit.handover.HandoverResponses.Category(
                        category.getId(), category.getName()
                ))
                .toList());
    }

    @Transactional
    public kr.ac.mju.linkit.handover.HandoverResponses.Category create(UUID ownerId, Category request) {
        HandoverCategory category = categoryRepository.save(new HandoverCategory(
                UUID.randomUUID(), ownerId, request.name().trim(), clock.instant()
        ));
        return new kr.ac.mju.linkit.handover.HandoverResponses.Category(
                category.getId(), category.getName()
        );
    }

    @Transactional
    public kr.ac.mju.linkit.handover.HandoverResponses.Category update(
            UUID ownerId,
            UUID categoryId,
            Category request
    ) {
        HandoverCategory category = find(ownerId, categoryId);
        category.rename(request.name().trim());
        return new kr.ac.mju.linkit.handover.HandoverResponses.Category(
                category.getId(), category.getName()
        );
    }

    @Transactional
    public void delete(UUID ownerId, UUID categoryId) {
        categoryRepository.delete(find(ownerId, categoryId));
    }

    private HandoverCategory find(UUID ownerId, UUID categoryId) {
        return categoryRepository.findByIdAndOwnerId(categoryId, ownerId)
                .orElseThrow(CategoryNotFound::new);
    }
}
