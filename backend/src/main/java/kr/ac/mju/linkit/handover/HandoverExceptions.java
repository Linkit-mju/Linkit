package kr.ac.mju.linkit.handover;

public final class HandoverExceptions {

    private HandoverExceptions() {
    }

    public static final class CategoryNotFound extends RuntimeException {
        public CategoryNotFound() {
            super("카테고리를 찾을 수 없습니다.");
        }
    }

    public static final class HandoverNotFound extends RuntimeException {
        public HandoverNotFound() {
            super("인수인계를 찾을 수 없습니다.");
        }
    }

    public static final class InvalidStatus extends RuntimeException {
        public InvalidStatus() {
            super("올바른 인수인계 상태를 선택해주세요.");
        }
    }
}
