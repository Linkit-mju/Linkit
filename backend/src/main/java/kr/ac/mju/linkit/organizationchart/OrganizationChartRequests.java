package kr.ac.mju.linkit.organizationchart;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public final class OrganizationChartRequests {
    private OrganizationChartRequests(){}
    public record CreateTerm(@NotBlank @Size(max=100) String name, @NotBlank @Size(max=100) String chartName, @NotNull LocalDate startsAt, @NotNull LocalDate endsAt){}
    public record UpdateTerm(@NotBlank @Size(max=100) String name, @NotBlank @Size(max=100) String chartName, @NotNull LocalDate startsAt, @NotNull LocalDate endsAt){}
    public record CreateDepartment(@NotNull UUID termId, @NotBlank @Size(max=100) String name){}
    public record Assign(@NotNull UUID termId, UUID departmentId, @NotNull UUID membershipId, @NotNull ChartAssignment.Position position){}
    public record UpdateProfile(@Size(max=30) String phone, @Size(max=1000) String profileImageUrl, boolean contactVisible){}
    public record CreateProfileImageUpload(@NotBlank @Pattern(regexp="image/(jpeg|png|webp)") String contentType, @Min(1) @Max(5242880) long size){}
}
