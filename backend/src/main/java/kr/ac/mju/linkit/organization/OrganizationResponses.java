package kr.ac.mju.linkit.organization;

import java.util.UUID;

public final class OrganizationResponses {

    private OrganizationResponses() {
    }

    public record JoinedOrganization(UUID id, String name) {
    }

    public record OrganizationDetails(UUID id, String name) {
    }
}
