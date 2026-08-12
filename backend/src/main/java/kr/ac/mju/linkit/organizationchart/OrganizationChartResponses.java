package kr.ac.mju.linkit.organizationchart;

import java.time.LocalDate;
import java.util.*;

public final class OrganizationChartResponses {
    private OrganizationChartResponses(){}
    public record Context(UUID organizationId, String organizationName, UUID selectedTermId, boolean canEdit, List<Term> terms, List<Department> departments, List<Member> members){}
    public record Term(UUID id, String name, String chartName, LocalDate startsAt, LocalDate endsAt, boolean managementActive){}
    public record ProfileImageUpload(String uploadUrl, String objectUrl, Map<String,String> headers){}
    public record Department(UUID id, String name, int sortOrder){}
    public record Member(UUID membershipId, UUID assignmentId, String name, String email, String phone, String profileImageUrl, boolean contactVisible, ChartAssignment.Position position, UUID departmentId, int sortOrder){}
}
