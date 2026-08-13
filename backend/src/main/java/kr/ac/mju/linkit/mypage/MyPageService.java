package kr.ac.mju.linkit.mypage;

import java.time.Clock;
import java.util.UUID;
import kr.ac.mju.linkit.organization.*;
import kr.ac.mju.linkit.user.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyPageService {
    private final UserRepository users;private final MembershipRepository memberships;private final OrganizationRepository organizations;private final Clock clock;
    public MyPageService(UserRepository users,MembershipRepository memberships,OrganizationRepository organizations,Clock clock){this.users=users;this.memberships=memberships;this.organizations=organizations;this.clock=clock;}
    @Transactional(readOnly=true) public MyPageResponses.Profile get(UUID userId){User user=user(userId);Membership membership=memberships.findFirstByUserIdOrderByJoinedAtAsc(userId).orElse(null);Organization organization=membership==null?null:organizations.findById(membership.getOrganizationId()).orElse(null);return new MyPageResponses.Profile(user.getId(),user.getName(),user.getEmail(),user.getEmailVerifiedAt(),membership==null?null:membership.getJoinedAt(),membership==null?null:membership.getId(),organization==null?null:organization.getName(),membership==null?null:membership.getPhone(),membership==null?null:membership.getProfileImageUrl(),membership==null||membership.isContactVisible());}
    @Transactional public void update(UUID userId,MyPageRequests.Update request){User user=user(userId);user.updateName(request.name().trim(),clock.instant());memberships.findFirstByUserIdOrderByJoinedAtAsc(userId).ifPresent(membership->membership.updateProfile(request.phone(),request.profileImageUrl(),request.contactVisible()));}
    private User user(UUID id){return users.findById(id).orElseThrow(()->new IllegalArgumentException("사용자를 찾을 수 없습니다."));}
}
