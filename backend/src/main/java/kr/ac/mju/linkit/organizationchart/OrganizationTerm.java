package kr.ac.mju.linkit.organizationchart;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "organization_terms")
public class OrganizationTerm {
    @Id private UUID id;
    @Column(name="organization_id", nullable=false) private UUID organizationId;
    @Column(nullable=false, length=100) private String name;
    @Column(name="chart_name", nullable=false, length=100) private String chartName;
    @Column(name="starts_at", nullable=false) private LocalDate startsAt;
    @Column(name="ends_at", nullable=false) private LocalDate endsAt;
    @Column(name="management_active", nullable=false) private boolean managementActive;
    @Column(name="management_granted_at") private Instant managementGrantedAt;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    protected OrganizationTerm() {}
    public OrganizationTerm(UUID id, UUID organizationId, String name, String chartName, LocalDate startsAt, LocalDate endsAt, Instant now) {
        this.id=id; this.organizationId=organizationId; this.name=name; this.chartName=chartName; this.startsAt=startsAt; this.endsAt=endsAt; this.createdAt=now;
    }
    public UUID getId(){return id;} public UUID getOrganizationId(){return organizationId;} public String getName(){return name;}
    public LocalDate getStartsAt(){return startsAt;} public LocalDate getEndsAt(){return endsAt;}
    public String getChartName(){return chartName;}
    public void update(String name,String chartName,LocalDate startsAt,LocalDate endsAt){this.name=name;this.chartName=chartName;this.startsAt=startsAt;this.endsAt=endsAt;}
    public boolean isManagementActive(){return managementActive;} public Instant getManagementGrantedAt(){return managementGrantedAt;}
    public void grantManagement(Instant at){managementActive=true; managementGrantedAt=at;}
    public void revokeManagement(){managementActive=false;}
}
