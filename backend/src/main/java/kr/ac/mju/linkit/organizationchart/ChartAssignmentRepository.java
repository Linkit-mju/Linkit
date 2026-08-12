package kr.ac.mju.linkit.organizationchart;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ChartAssignmentRepository extends JpaRepository<ChartAssignment,UUID>{
    List<ChartAssignment> findAllByTermIdOrderBySortOrderAsc(UUID termId);
    Optional<ChartAssignment> findByTermIdAndMembershipId(UUID termId, UUID membershipId);
    long countByTermIdAndPosition(UUID termId, ChartAssignment.Position position);
    long countByDepartmentId(UUID departmentId);
    boolean existsByMembershipIdAndPositionIn(UUID membershipId, Collection<ChartAssignment.Position> positions);
}
