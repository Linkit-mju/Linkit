package kr.ac.mju.linkit.organizationchart;

import java.time.*;
import java.util.*;
import kr.ac.mju.linkit.organization.*;
import kr.ac.mju.linkit.organizationchart.ChartAssignment.Position;
import kr.ac.mju.linkit.organizationchart.OrganizationChartResponses.*;
import kr.ac.mju.linkit.user.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationChartService {
    private static final Set<Position> OFFICERS = Set.of(Position.PRESIDENT, Position.VICE_PRESIDENT, Position.DIRECTOR);
    private final OrganizationTermRepository terms;
    private final ChartDepartmentRepository departments;
    private final ChartAssignmentRepository assignments;
    private final MembershipRepository memberships;
    private final OrganizationRepository organizations;
    private final UserRepository users;
    private final Clock clock;

    public OrganizationChartService(OrganizationTermRepository terms, ChartDepartmentRepository departments, ChartAssignmentRepository assignments, MembershipRepository memberships, OrganizationRepository organizations, UserRepository users, Clock clock){
        this.terms=terms;this.departments=departments;this.assignments=assignments;this.memberships=memberships;this.organizations=organizations;this.users=users;this.clock=clock;
    }

    @Transactional
    public void bootstrapFirstMember(Membership member) {
        if (terms.existsByOrganizationId(member.getOrganizationId())) return;
        LocalDate today=LocalDate.now(clock);
        Organization organization=organizations.findById(member.getOrganizationId()).orElseThrow(()->error("ORGANIZATION_NOT_FOUND","조직을 찾을 수 없습니다."));
        OrganizationTerm term=new OrganizationTerm(UUID.randomUUID(),member.getOrganizationId(),"1기",organization.getName(),today,today.plusYears(1).minusDays(1),clock.instant());
        term.grantManagement(clock.instant()); terms.save(term); seedDepartments(term.getId());
        assignments.save(new ChartAssignment(UUID.randomUUID(),term.getId(),null,member.getId(),Position.PRESIDENT,0,clock.instant()));
    }

    @Transactional(readOnly=true)
    public Context getContext(UUID userId, UUID requestedTermId) {
        Membership viewer=memberships.findFirstByUserIdOrderByJoinedAtAsc(userId).orElseThrow(()->error("ORGANIZATION_REQUIRED","먼저 조직에 가입해주세요."));
        Organization organization=organizations.findById(viewer.getOrganizationId()).orElseThrow(()->error("ORGANIZATION_NOT_FOUND","조직을 찾을 수 없습니다."));
        List<OrganizationTerm> termList=terms.findAllByOrganizationIdOrderByStartsAtDesc(organization.getId());
        if(termList.isEmpty()) throw error("CHART_NOT_INITIALIZED","조직도가 아직 생성되지 않았습니다.");
        OrganizationTerm selected=requestedTermId==null?termList.get(0):termList.stream().filter(t->t.getId().equals(requestedTermId)).findFirst().orElseThrow(()->error("TERM_NOT_FOUND","기수를 찾을 수 없습니다."));
        List<Membership> orgMembers=memberships.findAllByOrganizationIdOrderByJoinedAtAsc(organization.getId());
        Map<UUID,Membership> memberMap=new HashMap<>(); orgMembers.forEach(m->memberMap.put(m.getId(),m));
        List<ChartAssignment> chartAssignments=assignments.findAllByTermIdOrderBySortOrderAsc(selected.getId());
        Map<UUID,User> userMap=new HashMap<>();
        for(Membership m:orgMembers) users.findById(m.getUserId()).ifPresent(u->userMap.put(m.getId(),u));
        Map<UUID,ChartAssignment> assignmentMap=new HashMap<>(); chartAssignments.forEach(a->assignmentMap.put(a.getMembershipId(),a));
        List<Member> people=orgMembers.stream().map(m->{ User u=userMap.get(m.getId()); ChartAssignment a=assignmentMap.get(m.getId()); return new Member(m.getId(),a==null?null:a.getId(),u.getName(),u.getEmail(),m.isContactVisible()?m.getPhone():null,m.getProfileImageUrl(),m.isContactVisible(),a==null?null:a.getPosition(),a==null?null:a.getDepartmentId(),a==null?0:a.getSortOrder()); }).toList();
        return new Context(organization.getId(),organization.getName(),selected.getId(),canEdit(viewer,selected,termList),termList.stream().map(t->new Term(t.getId(),t.getName(),t.getChartName(),t.getStartsAt(),t.getEndsAt(),t.isManagementActive())).toList(),departments.findAllByTermIdAndArchivedFalseOrderBySortOrderAsc(selected.getId()).stream().map(d->new Department(d.getId(),d.getName(),d.getSortOrder())).toList(),people);
    }

    @Transactional
    public OrganizationTerm createTerm(UUID userId, OrganizationChartRequests.CreateTerm request){
        Membership actor=actor(userId); requireManager(actor);
        if(request.endsAt().isBefore(request.startsAt())) throw error("INVALID_TERM_DATES","종료일은 시작일보다 빠를 수 없습니다.");
        OrganizationTerm term=new OrganizationTerm(UUID.randomUUID(),actor.getOrganizationId(),request.name().trim(),request.chartName().trim(),request.startsAt(),request.endsAt(),clock.instant()); terms.saveAndFlush(term); seedDepartments(term.getId()); return term;
    }

    @Transactional public void updateTerm(UUID userId,UUID termId,OrganizationChartRequests.UpdateTerm request){Membership actor=actor(userId);OrganizationTerm term=term(actor,termId);requireEditor(actor,term);if(request.endsAt().isBefore(request.startsAt())) throw error("INVALID_TERM_DATES","종료일은 시작일보다 빠를 수 없습니다.");term.update(request.name().trim(),request.chartName().trim(),request.startsAt(),request.endsAt());}

    @Transactional
    public void delegate(UUID userId, UUID termId){
        Membership actor=actor(userId); requireManager(actor); OrganizationTerm target=term(actor,termId);
        if(target.isManagementActive()) return;
        List<OrganizationTerm> active=terms.findAllByOrganizationIdAndManagementActiveTrueOrderByManagementGrantedAtAsc(actor.getOrganizationId());
        if(active.size()>=2) active.get(0).revokeManagement();
        target.grantManagement(clock.instant());
    }

    @Transactional
    public ChartDepartment addDepartment(UUID userId, OrganizationChartRequests.CreateDepartment request){
        Membership actor=actor(userId); OrganizationTerm term=term(actor,request.termId()); requireEditor(actor,term);
        int order=(int)departments.countByTermIdAndArchivedFalse(term.getId());
        return departments.saveAndFlush(new ChartDepartment(UUID.randomUUID(),term.getId(),request.name().trim(),order));
    }

    @Transactional
    public void deleteDepartment(UUID userId, UUID departmentId){
        Membership actor=actor(userId); ChartDepartment department=departments.findById(departmentId).orElseThrow(()->error("DEPARTMENT_NOT_FOUND","국을 찾을 수 없습니다."));
        OrganizationTerm term=term(actor,department.getTermId()); requireEditor(actor,term);
        if(assignments.countByDepartmentId(departmentId)>0) throw error("DEPARTMENT_NOT_EMPTY","구성원이 있는 국은 삭제할 수 없습니다."); department.archive();
    }

    @Transactional
    public ChartAssignment assign(UUID userId, OrganizationChartRequests.Assign request){
        Membership actor=actor(userId); OrganizationTerm term=term(actor,request.termId()); requireEditor(actor,term);
        Membership member=memberships.findById(request.membershipId()).filter(m->m.getOrganizationId().equals(actor.getOrganizationId())).orElseThrow(()->error("MEMBER_NOT_FOUND","구성원을 찾을 수 없습니다."));
        if(assignments.findByTermIdAndMembershipId(term.getId(),member.getId()).isPresent()) throw error("MEMBER_ALREADY_ASSIGNED","한 기수에서 겸직할 수 없습니다.");
        if(request.position()==Position.PRESIDENT && assignments.countByTermIdAndPosition(term.getId(),Position.PRESIDENT)>=1) throw error("PRESIDENT_LIMIT","회장은 한 명만 등록할 수 있습니다.");
        if(request.position()==Position.VICE_PRESIDENT && assignments.countByTermIdAndPosition(term.getId(),Position.VICE_PRESIDENT)>=2) throw error("VICE_PRESIDENT_LIMIT","부회장은 최대 2명까지 등록할 수 있습니다.");
        if((request.position()==Position.DIRECTOR||request.position()==Position.MEMBER)&&request.departmentId()==null) throw error("DEPARTMENT_REQUIRED","국을 선택해주세요.");
        if(request.position()==Position.DIRECTOR && assignments.findAllByTermIdOrderBySortOrderAsc(term.getId()).stream().anyMatch(a->a.getPosition()==Position.DIRECTOR&&Objects.equals(a.getDepartmentId(),request.departmentId()))) throw error("DIRECTOR_LIMIT","국장은 국마다 한 명만 등록할 수 있습니다.");
        return assignments.saveAndFlush(new ChartAssignment(UUID.randomUUID(),term.getId(),request.departmentId(),member.getId(),request.position(),(int)assignments.count(),clock.instant()));
    }

    @Transactional public void unassign(UUID userId,UUID assignmentId){ Membership actor=actor(userId); ChartAssignment a=assignments.findById(assignmentId).orElseThrow(()->error("ASSIGNMENT_NOT_FOUND","배정을 찾을 수 없습니다.")); OrganizationTerm term=term(actor,a.getTermId()); requireEditor(actor,term); assignments.delete(a); }
    @Transactional public void updateProfile(UUID userId,UUID membershipId,OrganizationChartRequests.UpdateProfile request){ Membership actor=actor(userId); Membership target=memberships.findById(membershipId).filter(m->m.getOrganizationId().equals(actor.getOrganizationId())).orElseThrow(()->error("MEMBER_NOT_FOUND","구성원을 찾을 수 없습니다.")); if(!actor.getId().equals(target.getId())) requireManager(actor); target.updateProfile(request.phone(),request.profileImageUrl(),request.contactVisible()); }

    private void seedDepartments(UUID termId){ departments.saveAll(List.of(new ChartDepartment(UUID.randomUUID(),termId,"사무국",0),new ChartDepartment(UUID.randomUUID(),termId,"홍보국",1),new ChartDepartment(UUID.randomUUID(),termId,"기획국",2))); }
    private Membership actor(UUID userId){return memberships.findFirstByUserIdOrderByJoinedAtAsc(userId).orElseThrow(()->error("ORGANIZATION_REQUIRED","먼저 조직에 가입해주세요."));}
    private OrganizationTerm term(Membership actor,UUID id){return terms.findById(id).filter(t->t.getOrganizationId().equals(actor.getOrganizationId())).orElseThrow(()->error("TERM_NOT_FOUND","기수를 찾을 수 없습니다."));}
    private boolean isOfficer(Membership actor,UUID termId){return assignments.findByTermIdAndMembershipId(termId,actor.getId()).map(a->OFFICERS.contains(a.getPosition())).orElse(false);}
    private boolean canEdit(Membership actor,OrganizationTerm target,List<OrganizationTerm> all){return isOfficer(actor,target.getId())||all.stream().filter(OrganizationTerm::isManagementActive).anyMatch(t->isOfficer(actor,t.getId()));}
    private void requireEditor(Membership actor,OrganizationTerm target){if(!canEdit(actor,target,terms.findAllByOrganizationIdOrderByStartsAtDesc(actor.getOrganizationId()))) throw error("CHART_ACCESS_DENIED","조직도를 수정할 권한이 없습니다.");}
    private void requireManager(Membership actor){if(terms.findAllByOrganizationIdAndManagementActiveTrueOrderByManagementGrantedAtAsc(actor.getOrganizationId()).stream().noneMatch(t->isOfficer(actor,t.getId()))) throw error("CHART_ACCESS_DENIED","조직 관리자 권한이 필요합니다.");}
    private OrganizationChartException error(String code,String message){return new OrganizationChartException(code,message);}
}
