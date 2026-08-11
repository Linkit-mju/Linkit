package kr.ac.mju.linkit.organization;

import java.util.UUID;
import kr.ac.mju.linkit.organization.OrganizationExceptions.OrganizationAccessDenied;
import org.springframework.stereotype.Component;

@Component
public class OrganizationAccessPolicy {

    private final MembershipRepository membershipRepository;

    public OrganizationAccessPolicy(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    public void requireMembership(UUID userId, UUID organizationId) {
        if (!membershipRepository.existsByUserIdAndOrganizationId(
                userId,
                organizationId
        )) {
            throw new OrganizationAccessDenied();
        }
    }
}
