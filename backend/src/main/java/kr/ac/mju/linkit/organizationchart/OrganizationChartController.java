package kr.ac.mju.linkit.organizationchart;

import jakarta.validation.Valid;
import java.util.UUID;
import kr.ac.mju.linkit.auth.AuthenticatedUser;
import kr.ac.mju.linkit.organizationchart.OrganizationChartRequests.*;
import kr.ac.mju.linkit.organizationchart.OrganizationChartResponses.Context;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class OrganizationChartController {
    private final OrganizationChartService service;
    private final ProfileImageUploadService uploads;
    public OrganizationChartController(OrganizationChartService service,ProfileImageUploadService uploads){this.service=service;this.uploads=uploads;}
    @GetMapping("/organization-chart") public Context context(@AuthenticationPrincipal AuthenticatedUser user,@RequestParam(required=false) UUID termId){return service.getContext(user.id(),termId);}
    @PostMapping("/organization-terms") @ResponseStatus(HttpStatus.CREATED) public void createTerm(@AuthenticationPrincipal AuthenticatedUser user,@Valid @RequestBody CreateTerm request){service.createTerm(user.id(),request);}
    @PatchMapping("/organization-terms/{termId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void updateTerm(@AuthenticationPrincipal AuthenticatedUser user,@PathVariable UUID termId,@Valid @RequestBody UpdateTerm request){service.updateTerm(user.id(),termId,request);}
    @PostMapping("/organization-terms/{termId}/delegate") @ResponseStatus(HttpStatus.NO_CONTENT) public void delegate(@AuthenticationPrincipal AuthenticatedUser user,@PathVariable UUID termId){service.delegate(user.id(),termId);}
    @PostMapping("/organization-chart/departments") @ResponseStatus(HttpStatus.CREATED) public void department(@AuthenticationPrincipal AuthenticatedUser user,@Valid @RequestBody CreateDepartment request){service.addDepartment(user.id(),request);}
    @DeleteMapping("/organization-chart/departments/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteDepartment(@AuthenticationPrincipal AuthenticatedUser user,@PathVariable UUID id){service.deleteDepartment(user.id(),id);}
    @PostMapping("/organization-chart/assignments") @ResponseStatus(HttpStatus.CREATED) public void assign(@AuthenticationPrincipal AuthenticatedUser user,@Valid @RequestBody Assign request){service.assign(user.id(),request);}
    @DeleteMapping("/organization-chart/assignments/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void unassign(@AuthenticationPrincipal AuthenticatedUser user,@PathVariable UUID id){service.unassign(user.id(),id);}
    @PatchMapping("/organization-chart/members/{id}/profile") @ResponseStatus(HttpStatus.NO_CONTENT) public void profile(@AuthenticationPrincipal AuthenticatedUser user,@PathVariable UUID id,@Valid @RequestBody UpdateProfile request){service.updateProfile(user.id(),id,request);}
    @PostMapping("/organization-chart/members/{id}/profile-image-upload") public OrganizationChartResponses.ProfileImageUpload profileImageUpload(@AuthenticationPrincipal AuthenticatedUser user,@PathVariable UUID id,@Valid @RequestBody CreateProfileImageUpload request){return uploads.create(user.id(),id,request.contentType(),request.size());}
}
