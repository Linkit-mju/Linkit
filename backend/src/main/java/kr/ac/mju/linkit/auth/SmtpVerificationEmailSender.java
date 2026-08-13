package kr.ac.mju.linkit.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "linkit.mail.provider",
        havingValue = "smtp",
        matchIfMissing = true
)
public class SmtpVerificationEmailSender implements VerificationEmailSender {

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpVerificationEmailSender(
            JavaMailSender mailSender,
            @Value("${linkit.mail.from}") String from
    ) {
        this.mailSender = mailSender;
        this.from = from;
    }

    @Override
    public void sendVerificationEmail(String recipient, String verificationUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("[Linkit] 학교 이메일을 인증해주세요");
        message.setText("""
                Linkit 회원가입을 완료하려면 아래 링크를 열어주세요.

                %s

                이 링크는 30분 동안 유효합니다. 요청하지 않았다면 이 메일을 무시해주세요.
                """.formatted(verificationUrl));
        mailSender.send(message);
    }
}
