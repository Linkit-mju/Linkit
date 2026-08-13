package kr.ac.mju.linkit.mypage;

import jakarta.validation.Valid;
import kr.ac.mju.linkit.auth.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/my-page")
public class MyPageController {
    private final MyPageService service;
    public MyPageController(MyPageService service){this.service=service;}
    @GetMapping public MyPageResponses.Profile profile(@AuthenticationPrincipal AuthenticatedUser user){return service.get(user.id());}
    @PatchMapping @ResponseStatus(HttpStatus.NO_CONTENT) public void update(@AuthenticationPrincipal AuthenticatedUser user,@Valid @RequestBody MyPageRequests.Update request){service.update(user.id(),request);}
}
