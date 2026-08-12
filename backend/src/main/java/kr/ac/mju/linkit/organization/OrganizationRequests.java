package kr.ac.mju.linkit.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class OrganizationRequests {

    private OrganizationRequests() {
    }

    public record Join(
            @NotBlank(message = "초대코드를 입력해주세요.")
            String inviteCode
    ) {
    }

    public record Update(
            @NotBlank(message = "조직 이름을 입력해주세요.")
            @Size(max = 150, message = "조직 이름은 150자 이하여야 합니다.")
            String name
    ) {
    }
}
