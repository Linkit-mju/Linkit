package kr.ac.mju.linkit.handover;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "handovers")
public class Handover {

    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String owner;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, columnDefinition = "text")
    private String summary;

    @Column(name = "critical_notes", nullable = false, columnDefinition = "text")
    private String criticalNotes;

    @Column(name = "recurring_tasks", nullable = false, columnDefinition = "text")
    private String recurringTasks;

    @Column(nullable = false, columnDefinition = "text")
    private String checklist;

    @Column(name = "references_text", nullable = false, columnDefinition = "text")
    private String references;

    @Column(name = "open_questions", nullable = false, columnDefinition = "text")
    private String openQuestions;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Handover() {
    }

    public Handover(
            UUID id,
            UUID ownerId,
            UUID categoryId,
            String title,
            String owner,
            String status,
            String summary,
            String criticalNotes,
            String recurringTasks,
            String checklist,
            String references,
            String openQuestions,
            Instant updatedAt
    ) {
        this.id = id;
        this.ownerId = ownerId;
        update(
                categoryId,
                title,
                owner,
                status,
                summary,
                criticalNotes,
                recurringTasks,
                checklist,
                references,
                openQuestions,
                updatedAt
        );
    }

    public void update(
            UUID categoryId,
            String title,
            String owner,
            String status,
            String summary,
            String criticalNotes,
            String recurringTasks,
            String checklist,
            String references,
            String openQuestions,
            Instant updatedAt
    ) {
        this.categoryId = categoryId;
        this.title = title;
        this.owner = owner;
        this.status = status;
        this.summary = summary;
        this.criticalNotes = criticalNotes;
        this.recurringTasks = recurringTasks;
        this.checklist = checklist;
        this.references = references;
        this.openQuestions = openQuestions;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public String getTitle() {
        return title;
    }

    public String getOwner() {
        return owner;
    }

    public String getStatus() {
        return status;
    }

    public String getSummary() {
        return summary;
    }

    public String getCriticalNotes() {
        return criticalNotes;
    }

    public String getRecurringTasks() {
        return recurringTasks;
    }

    public String getChecklist() {
        return checklist;
    }

    public String getReferences() {
        return references;
    }

    public String getOpenQuestions() {
        return openQuestions;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
