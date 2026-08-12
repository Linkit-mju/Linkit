package kr.ac.mju.linkit.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping({"/login", "/signup"})
    String frontendRoute() {
        return "forward:/index.html";
    }
}
