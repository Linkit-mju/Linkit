package kr.ac.mju.linkit.organization;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "memberships")
public class Membership {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    protected Membership() {
    }

    public Membership(
            UUID id,
            UUID userId,
            UUID organizationId,
            Instant joinedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.organizationId = organizationId;
        this.joinedAt = joinedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }
}
