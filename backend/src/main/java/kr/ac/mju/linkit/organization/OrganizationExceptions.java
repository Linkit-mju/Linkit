package kr.ac.mju.linkit.organization;

public final class OrganizationExceptions {

    private OrganizationExceptions() {
    }

    public static final class InvalidInviteCode extends RuntimeException {
        public InvalidInviteCode() {
            super("유효하지 않는 초대코드입니다");
        }
    }

    public static final class AlreadyJoinedOrganization extends RuntimeException {
        public AlreadyJoinedOrganization() {
            super("이미 가입된 조직입니다");
        }
    }

    public static final class OrganizationAccessDenied extends RuntimeException {
        public OrganizationAccessDenied() {
            super("이 조직의 정보를 이용할 권한이 없습니다.");
        }
    }
}
