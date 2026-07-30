package kr.ac.mju.linkit.auth;

import java.util.UUID;

public final class AuthResponses {

    private AuthResponses() {
    }

    public record UserResponse(UUID id, String email, String name) {
    }

    public record CsrfResponse(String headerName, String token) {
    }
}
