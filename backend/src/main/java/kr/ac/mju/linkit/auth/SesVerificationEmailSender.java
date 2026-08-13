package kr.ac.mju.linkit.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

@Component
@ConditionalOnProperty(name = "linkit.mail.provider", havingValue = "ses")
public class SesVerificationEmailSender implements VerificationEmailSender {

    private final SesV2Client sesClient;
    private final String from;

    public SesVerificationEmailSender(
            @Value("${linkit.mail.region:${AWS_REGION:ap-northeast-2}}") String region,
            @Value("${linkit.mail.from}") String from
    ) {
        this(SesV2Client.builder().region(Region.of(region)).build(), from);
    }

    SesVerificationEmailSender(SesV2Client sesClient, String from) {
        this.sesClient = sesClient;
        this.from = from;
    }

    @Override
    public void sendVerificationEmail(String recipient, String verificationUrl) {
        Content subject = Content.builder()
                .data("[Linkit] 학교 이메일을 인증해주세요")
                .charset("UTF-8")
                .build();
        Content text = Content.builder()
                .data("""
                        Linkit 회원가입을 완료하려면 아래 링크를 열어주세요.

                        %s

                        이 링크는 30분 동안 유효합니다. 요청하지 않았다면 이 메일을 무시해주세요.
                        """.formatted(verificationUrl))
                .charset("UTF-8")
                .build();
        SendEmailRequest request = SendEmailRequest.builder()
                .fromEmailAddress(from)
                .destination(Destination.builder().toAddresses(recipient).build())
                .content(EmailContent.builder()
                        .simple(Message.builder()
                                .subject(subject)
                                .body(Body.builder().text(text).build())
                                .build())
                        .build())
                .build();
        sesClient.sendEmail(request);
    }
}
