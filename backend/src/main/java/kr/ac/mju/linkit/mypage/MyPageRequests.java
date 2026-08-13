package kr.ac.mju.linkit.mypage;

import jakarta.validation.constraints.*;

public final class MyPageRequests {
    private MyPageRequests(){}
    public record Update(@NotBlank @Size(max=100) String name,@Pattern(regexp="^$|^\\d{3}-\\d{4}-\\d{4}$",message="전화번호는 000-0000-0000 형식이어야 합니다.") String phone,@Size(max=1000) String profileImageUrl,boolean contactVisible){}
}
