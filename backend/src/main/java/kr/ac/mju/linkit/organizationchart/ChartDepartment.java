package kr.ac.mju.linkit.organizationchart;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="organization_departments")
public class ChartDepartment {
    @Id private UUID id;
    @Column(name="term_id",nullable=false) private UUID termId;
    @Column(nullable=false,length=100) private String name;
    @Column(name="sort_order",nullable=false) private int sortOrder;
    @Column(nullable=false) private boolean archived;
    protected ChartDepartment(){}
    public ChartDepartment(UUID id, UUID termId, String name, int sortOrder){this.id=id;this.termId=termId;this.name=name;this.sortOrder=sortOrder;}
    public UUID getId(){return id;} public UUID getTermId(){return termId;} public String getName(){return name;} public int getSortOrder(){return sortOrder;} public boolean isArchived(){return archived;}
    public void archive(){archived=true;}
}
