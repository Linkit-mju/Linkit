package kr.ac.mju.linkit.auth;

public interface VerificationEmailSender {

    void sendVerificationEmail(String recipient, String verificationUrl);
}
