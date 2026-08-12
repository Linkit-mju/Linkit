package kr.ac.mju.linkit.organization;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipRepository extends JpaRepository<Membership, UUID> {

    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}
