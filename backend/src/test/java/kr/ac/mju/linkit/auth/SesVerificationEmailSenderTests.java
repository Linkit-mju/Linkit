package kr.ac.mju.linkit.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

class SesVerificationEmailSenderTests {

    @Test
    void sendsUtf8VerificationEmailThroughSes() {
        SesV2Client client = Mockito.mock(SesV2Client.class);
        SesVerificationEmailSender sender = new SesVerificationEmailSender(
                client,
                "no-reply@example.com"
        );

        sender.sendVerificationEmail(
                "student@mju.ac.kr",
                "https://linkit.example/verify-email?token=secret"
        );

        ArgumentCaptor<SendEmailRequest> captor =
                ArgumentCaptor.forClass(SendEmailRequest.class);
        verify(client).sendEmail(captor.capture());
        SendEmailRequest request = captor.getValue();
        assertThat(request.fromEmailAddress()).isEqualTo("no-reply@example.com");
        assertThat(request.destination().toAddresses()).containsExactly("student@mju.ac.kr");
        assertThat(request.content().simple().subject().charset()).isEqualTo("UTF-8");
        assertThat(request.content().simple().body().text().data())
                .contains("https://linkit.example/verify-email?token=secret");
    }
}
