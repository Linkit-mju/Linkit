package kr.ac.mju.linkit.organizationchart;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ChartDepartmentRepository extends JpaRepository<ChartDepartment,UUID>{
    List<ChartDepartment> findAllByTermIdAndArchivedFalseOrderBySortOrderAsc(UUID termId);
    long countByTermIdAndArchivedFalse(UUID termId);
}
