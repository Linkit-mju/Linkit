package kr.ac.mju.linkit.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping({
            "/login",
            "/signup",
            "/verify-email",
            "/verify-email/pending",
            "/organization/join",
            "/organization/join/success",
            "/organization-chart",
            "/my-page"
    })
    String frontendRoute() {
        return "forward:/index.html";
    }
}
