package kr.ac.mju.linkit.mypage;

import java.time.Instant;
import java.util.UUID;

public final class MyPageResponses {
    private MyPageResponses(){}
    public record Profile(UUID userId,String name,String email,Instant emailVerifiedAt,Instant joinedAt,UUID membershipId,String organizationName,String phone,String profileImageUrl,boolean contactVisible){}
}
