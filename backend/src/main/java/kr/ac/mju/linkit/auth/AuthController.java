package kr.ac.mju.linkit.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import kr.ac.mju.linkit.auth.AuthRequests.Login;
import kr.ac.mju.linkit.auth.AuthRequests.SignUp;
import kr.ac.mju.linkit.auth.AuthRequests.ConfirmEmail;
import kr.ac.mju.linkit.auth.AuthRequests.ResendEmailVerification;
import kr.ac.mju.linkit.auth.AuthResponses.CsrfResponse;
import kr.ac.mju.linkit.auth.AuthResponses.UserResponse;
import kr.ac.mju.linkit.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final SimpleGrantedAuthority USER_AUTHORITY =
            new SimpleGrantedAuthority("ROLE_USER");

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final HttpSessionSecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(
            AuthService authService,
            EmailVerificationService emailVerificationService
    ) {
        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken csrfToken) {
        return new CsrfResponse(csrfToken.getHeaderName(), csrfToken.getToken());
    }

    @PostMapping("/sign-up")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse signUp(@Valid @RequestBody SignUp request) {
        return toResponse(authService.signUp(request));
    }

    @PostMapping("/email-verifications/confirm")
    public UserResponse confirmEmail(@Valid @RequestBody ConfirmEmail request) {
        return toResponse(emailVerificationService.confirm(request.token()));
    }

    @PostMapping("/email-verifications/resend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendEmailVerification(
            @Valid @RequestBody ResendEmailVerification request
    ) {
        emailVerificationService.resend(request.email());
    }

    @PostMapping("/login")
    public UserResponse login(
            @Valid @RequestBody Login request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        User user = authService.authenticate(request);
        AuthenticatedUser principal =
                new AuthenticatedUser(user.getId(), user.getEmail(), user.getName());
        UsernamePasswordAuthenticationToken authentication =
                UsernamePasswordAuthenticationToken.authenticated(
                        principal,
                        null,
                        java.util.List.of(USER_AUTHORITY)
                );

        httpRequest.getSession(true);
        httpRequest.changeSessionId();
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return toResponse(user);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthenticatedUser user) {
        return new UserResponse(user.id(), user.email(), user.name());
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName());
    }
}
