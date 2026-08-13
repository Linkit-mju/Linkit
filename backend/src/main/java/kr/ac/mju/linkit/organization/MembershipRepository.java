package kr.ac.mju.linkit.organization;

import java.util.UUID;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipRepository extends JpaRepository<Membership, UUID> {

    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    long countByOrganizationId(UUID organizationId);
    Optional<Membership> findFirstByUserIdOrderByJoinedAtAsc(UUID userId);
    List<Membership> findAllByOrganizationIdOrderByJoinedAtAsc(UUID organizationId);
}
