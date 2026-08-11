package kr.ac.mju.linkit.organization;

import java.time.Clock;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import kr.ac.mju.linkit.organization.OrganizationExceptions.AlreadyJoinedOrganization;
import kr.ac.mju.linkit.organization.OrganizationExceptions.InvalidInviteCode;
import kr.ac.mju.linkit.organization.OrganizationExceptions.OrganizationAccessDenied;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {

    private static final Pattern INVITE_CODE = Pattern.compile("^[A-Z0-9]{6}$");

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final OrganizationAccessPolicy organizationAccessPolicy;
    private final Clock clock;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            MembershipRepository membershipRepository,
            OrganizationAccessPolicy organizationAccessPolicy,
            Clock clock
    ) {
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.organizationAccessPolicy = organizationAccessPolicy;
        this.clock = clock;
    }

    @Transactional
    public Organization join(UUID userId, String rawInviteCode) {
        String inviteCode = normalize(rawInviteCode);
        if (!INVITE_CODE.matcher(inviteCode).matches()) {
            throw new InvalidInviteCode();
        }

        Organization organization = organizationRepository.findByInviteCode(inviteCode)
                .orElseThrow(InvalidInviteCode::new);

        if (membershipRepository.existsByUserIdAndOrganizationId(
                userId,
                organization.getId()
        )) {
            throw new AlreadyJoinedOrganization();
        }

        Membership membership = new Membership(
                UUID.randomUUID(),
                userId,
                organization.getId(),
                clock.instant()
        );

        try {
            membershipRepository.saveAndFlush(membership);
        } catch (DataIntegrityViolationException exception) {
            throw new AlreadyJoinedOrganization();
        }

        return organization;
    }

    @Transactional(readOnly = true)
    public Organization get(UUID userId, UUID organizationId) {
        organizationAccessPolicy.requireMembership(userId, organizationId);
        return organizationRepository.findById(organizationId)
                .orElseThrow(OrganizationAccessDenied::new);
    }

    @Transactional
    public Organization update(UUID userId, UUID organizationId, String rawName) {
        organizationAccessPolicy.requireMembership(userId, organizationId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(OrganizationAccessDenied::new);
        organization.updateName(rawName.trim(), clock.instant());
        return organization;
    }

    private String normalize(String inviteCode) {
        return inviteCode == null
                ? ""
                : inviteCode.trim().toUpperCase(Locale.ROOT);
    }
}
