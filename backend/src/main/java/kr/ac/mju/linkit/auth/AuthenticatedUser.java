package kr.ac.mju.linkit.auth;

import java.io.Serializable;
import java.security.Principal;
import java.util.UUID;

public record AuthenticatedUser(UUID id, String email, String name)
        implements Principal, Serializable {

    @Override
    public String getName() {
        return email;
    }
}
