package kr.ac.mju.linkit.organizationchart;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrganizationTermRepository extends JpaRepository<OrganizationTerm,UUID>{
    List<OrganizationTerm> findAllByOrganizationIdOrderByStartsAtDesc(UUID organizationId);
    List<OrganizationTerm> findAllByOrganizationIdAndManagementActiveTrueOrderByManagementGrantedAtAsc(UUID organizationId);
    boolean existsByOrganizationId(UUID organizationId);
}
