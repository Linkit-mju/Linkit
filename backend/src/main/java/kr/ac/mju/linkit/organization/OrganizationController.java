package kr.ac.mju.linkit.organization;

import jakarta.validation.Valid;
import kr.ac.mju.linkit.auth.AuthenticatedUser;
import kr.ac.mju.linkit.organization.OrganizationRequests.Join;
import kr.ac.mju.linkit.organization.OrganizationRequests.Update;
import kr.ac.mju.linkit.organization.OrganizationResponses.JoinedOrganization;
import kr.ac.mju.linkit.organization.OrganizationResponses.OrganizationDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping("/join")
    @ResponseStatus(HttpStatus.CREATED)
    public JoinedOrganization join(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody Join request
    ) {
        Organization organization = organizationService.join(user.id(), request.inviteCode());
        return new JoinedOrganization(organization.getId(), organization.getName());
    }

    @GetMapping("/{organizationId}")
    public OrganizationDetails get(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID organizationId
    ) {
        return toDetails(organizationService.get(user.id(), organizationId));
    }

    @PatchMapping("/{organizationId}")
    public OrganizationDetails update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID organizationId,
            @Valid @RequestBody Update request
    ) {
        return toDetails(organizationService.update(
                user.id(),
                organizationId,
                request.name()
        ));
    }

    private OrganizationDetails toDetails(Organization organization) {
        return new OrganizationDetails(organization.getId(), organization.getName());
    }
}
