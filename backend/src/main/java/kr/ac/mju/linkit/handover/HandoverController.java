package kr.ac.mju.linkit.handover;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import kr.ac.mju.linkit.auth.AuthenticatedUser;
import kr.ac.mju.linkit.handover.HandoverRequests.Category;
import kr.ac.mju.linkit.handover.HandoverResponses.CategoryList;
import kr.ac.mju.linkit.handover.HandoverResponses.HandoverList;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HandoverController {

    private final HandoverCategoryService categoryService;
    private final HandoverService handoverService;

    public HandoverController(
            HandoverCategoryService categoryService,
            HandoverService handoverService
    ) {
        this.categoryService = categoryService;
        this.handoverService = handoverService;
    }

    @GetMapping("/handover-categories")
    public CategoryList categories(@AuthenticationPrincipal AuthenticatedUser user) {
        return categoryService.list(user.id());
    }

    @PostMapping("/handover-categories")
    public ResponseEntity<kr.ac.mju.linkit.handover.HandoverResponses.Category> createCategory(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody Category request
    ) {
        var category = categoryService.create(user.id(), request);
        return ResponseEntity.created(URI.create("/api/v1/handover-categories/" + category.id()))
                .body(category);
    }

    @PatchMapping("/handover-categories/{categoryId}")
    public kr.ac.mju.linkit.handover.HandoverResponses.Category updateCategory(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID categoryId,
            @Valid @RequestBody Category request
    ) {
        return categoryService.update(user.id(), categoryId, request);
    }

    @DeleteMapping("/handover-categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID categoryId
    ) {
        categoryService.delete(user.id(), categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/handovers")
    public HandoverList handovers(@AuthenticationPrincipal AuthenticatedUser user) {
        return handoverService.list(user.id());
    }

    @PostMapping("/handovers")
    public ResponseEntity<kr.ac.mju.linkit.handover.HandoverResponses.Handover> createHandover(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody HandoverRequests.Handover request
    ) {
        var handover = handoverService.create(user.id(), request);
        return ResponseEntity.created(URI.create("/api/v1/handovers/" + handover.id()))
                .body(handover);
    }

    @PutMapping("/handovers/{handoverId}")
    public kr.ac.mju.linkit.handover.HandoverResponses.Handover updateHandover(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID handoverId,
            @Valid @RequestBody HandoverRequests.Handover request
    ) {
        return handoverService.update(user.id(), handoverId, request);
    }

    @DeleteMapping("/handovers/{handoverId}")
    public ResponseEntity<Void> deleteHandover(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID handoverId
    ) {
        handoverService.delete(user.id(), handoverId);
        return ResponseEntity.noContent().build();
    }
}
