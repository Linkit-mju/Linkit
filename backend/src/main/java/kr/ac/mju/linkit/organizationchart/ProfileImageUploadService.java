package kr.ac.mju.linkit.organizationchart;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import kr.ac.mju.linkit.organization.Membership;
import kr.ac.mju.linkit.organization.MembershipRepository;
import kr.ac.mju.linkit.organizationchart.OrganizationChartResponses.ProfileImageUpload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
public class ProfileImageUploadService {
    private final MembershipRepository memberships;
    private final OrganizationTermRepository terms;
    private final ChartAssignmentRepository assignments;
    private final String bucket;
    private final String region;
    private final String publicBaseUrl;
    public ProfileImageUploadService(MembershipRepository memberships,OrganizationTermRepository terms,ChartAssignmentRepository assignments,@Value("${linkit.storage.profile-images.bucket:}") String bucket,@Value("${linkit.storage.profile-images.region:ap-northeast-2}") String region,@Value("${linkit.storage.profile-images.public-base-url:}") String publicBaseUrl){this.memberships=memberships;this.terms=terms;this.assignments=assignments;this.bucket=bucket;this.region=region;this.publicBaseUrl=publicBaseUrl;}
    public ProfileImageUpload create(UUID userId,UUID membershipId,String contentType,long size){
        Membership actor=memberships.findFirstByUserIdOrderByJoinedAtAsc(userId).orElseThrow(()->new OrganizationChartException("ORGANIZATION_REQUIRED","먼저 조직에 가입해주세요."));
        Membership target=memberships.findById(membershipId).filter(m->m.getOrganizationId().equals(actor.getOrganizationId())).orElseThrow(()->new OrganizationChartException("MEMBER_NOT_FOUND","구성원을 찾을 수 없습니다."));
        boolean manager=terms.findAllByOrganizationIdAndManagementActiveTrueOrderByManagementGrantedAtAsc(actor.getOrganizationId()).stream().anyMatch(term->assignments.findByTermIdAndMembershipId(term.getId(),actor.getId()).map(assignment->Set.of(ChartAssignment.Position.PRESIDENT,ChartAssignment.Position.VICE_PRESIDENT,ChartAssignment.Position.DIRECTOR).contains(assignment.getPosition())).orElse(false));
        if(!actor.getId().equals(target.getId())&&!manager) throw new OrganizationChartException("CHART_ACCESS_DENIED","조직 관리자 권한이 필요합니다.");
        if(bucket.isBlank()||publicBaseUrl.isBlank()) throw new OrganizationChartException("PROFILE_IMAGE_STORAGE_NOT_CONFIGURED","프로필 이미지 저장소가 아직 설정되지 않았습니다.");
        String extension=switch(contentType){case "image/jpeg"->"jpg";case "image/png"->"png";case "image/webp"->"webp";default->throw new OrganizationChartException("INVALID_IMAGE_TYPE","JPG, PNG, WebP 이미지만 업로드할 수 있습니다.");};
        String key="organizations/"+target.getOrganizationId()+"/profiles/"+membershipId+"/"+UUID.randomUUID()+"."+extension;
        PutObjectRequest put=PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).contentLength(size).build();
        try(S3Presigner presigner=S3Presigner.builder().region(Region.of(region)).build()){
            String uploadUrl=presigner.presignPutObject(PutObjectPresignRequest.builder().signatureDuration(Duration.ofMinutes(5)).putObjectRequest(put).build()).url().toString();
            return new ProfileImageUpload(uploadUrl,URI.create(publicBaseUrl.endsWith("/")?publicBaseUrl:publicBaseUrl+"/").resolve(key).toString(),Map.of("Content-Type",contentType));
        }
    }
}
