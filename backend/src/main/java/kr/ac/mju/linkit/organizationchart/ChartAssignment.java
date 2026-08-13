package kr.ac.mju.linkit.organizationchart;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="organization_chart_assignments")
public class ChartAssignment {
    public enum Position { PRESIDENT, VICE_PRESIDENT, DIRECTOR, MEMBER }
    @Id private UUID id;
    @Column(name="term_id",nullable=false) private UUID termId;
    @Column(name="department_id") private UUID departmentId;
    @Column(name="membership_id",nullable=false) private UUID membershipId;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private Position position;
    @Column(name="sort_order",nullable=false) private int sortOrder;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    protected ChartAssignment(){}
    public ChartAssignment(UUID id, UUID termId, UUID departmentId, UUID membershipId, Position position, int sortOrder, Instant now){this.id=id;this.termId=termId;this.departmentId=departmentId;this.membershipId=membershipId;this.position=position;this.sortOrder=sortOrder;this.createdAt=now;}
    public UUID getId(){return id;} public UUID getTermId(){return termId;} public UUID getDepartmentId(){return departmentId;} public UUID getMembershipId(){return membershipId;} public Position getPosition(){return position;} public int getSortOrder(){return sortOrder;}
}
