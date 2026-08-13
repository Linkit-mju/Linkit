package kr.ac.mju.linkit.organizationchart;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.*;
import java.util.UUID;
import kr.ac.mju.linkit.organization.*;
import kr.ac.mju.linkit.organizationchart.OrganizationChartRequests.CreateTerm;
import kr.ac.mju.linkit.user.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class OrganizationChartServiceIntegrationTests {
    private static final UUID ORGANIZATION_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    @Autowired OrganizationChartService service;
    @Autowired OrganizationTermRepository terms;
    @Autowired ChartDepartmentRepository departments;
    @Autowired ChartAssignmentRepository assignments;
    @Autowired MembershipRepository memberships;
    @Autowired UserRepository users;

    @BeforeEach
    void clean() {
        assignments.deleteAll();
        departments.deleteAll();
        terms.deleteAll();
        memberships.deleteAll();
        users.deleteAll();
    }

    @Test
    void bootstrapsDefaultChartAndRotatesManagementToTheNewestTwoTerms() {
        Instant now = Instant.now();
        User user = users.saveAndFlush(new User(UUID.randomUUID(), "president@mju.ac.kr", "초대 회장", "hash", UserStatus.ACTIVE, now, now, now, now));
        Membership membership = memberships.saveAndFlush(new Membership(UUID.randomUUID(), user.getId(), ORGANIZATION_ID, now));
        service.bootstrapFirstMember(membership);

        var first = service.getContext(user.getId(), null);
        assertThat(first.departments()).extracting(OrganizationChartResponses.Department::name)
                .containsExactly("사무국", "홍보국", "기획국");
        assertThat(first.members()).singleElement().satisfies(member -> {
            assertThat(member.name()).isEqualTo("초대 회장");
            assertThat(member.position()).isEqualTo(ChartAssignment.Position.PRESIDENT);
        });

        OrganizationTerm second = service.createTerm(user.getId(), new CreateTerm("2기", "ONOFF", LocalDate.of(2027, 1, 1), LocalDate.of(2027, 12, 31)));
        service.delegate(user.getId(), second.getId());
        OrganizationTerm third = service.createTerm(user.getId(), new CreateTerm("3기", "ONOFF", LocalDate.of(2028, 1, 1), LocalDate.of(2028, 12, 31)));
        service.delegate(user.getId(), third.getId());

        assertThat(terms.findAllByOrganizationIdAndManagementActiveTrueOrderByManagementGrantedAtAsc(ORGANIZATION_ID))
                .extracting(OrganizationTerm::getName)
                .containsExactly("2기", "3기");
    }
}
