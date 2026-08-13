package com.classsync.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class EmailService {
    @Autowired private JavaMailSender mailSender;
    
    @Value("${app.brevo.api-key:}") private String brevoApiKey;
    @Value("${app.brevo.sender.email:}") private String brevoSenderEmail;
    @Value("${app.brevo.sender.name:}") private String brevoSenderName;
    
    @Value("${app.resend.api-key:}") private String resendApiKey;
    @Value("${app.resend.from:}") private String resendFrom;
    
    @Value("${spring.mail.username:}") private String smtpFrom;

    private final WebClient webClient = WebClient.create();

    public void sendOtp(String to, String otp) {
        if (brevoApiKey != null && !brevoApiKey.isEmpty()) {
            webClient.post().uri("https://api.brevo.com/v3/smtp/email")
                .header("api-key", brevoApiKey).header("Content-Type", "application/json")
                .bodyValue(Map.<String, Object>of("sender", Map.of("name", brevoSenderName, "email", brevoSenderEmail),
                                  "to", new Object[]{Map.of("email", to)},
                                  "subject", "Your ClassSync verification code",
                                  "textContent", "Your ClassSync verification code is " + otp + ".",
                                  "htmlContent", "<p>Your ClassSync verification code is:</p><h1>" + otp + "</h1><p>Enter this code to complete registration.</p>"))
                .retrieve().bodyToMono(String.class).block();
        } else if (resendApiKey != null && !resendApiKey.isEmpty()) {
            webClient.post().uri("https://api.resend.com/emails")
                .header("Authorization", "Bearer " + resendApiKey).header("Content-Type", "application/json")
                .bodyValue(Map.<String, Object>of("from", resendFrom, "to", new String[]{to},
                                  "subject", "Your ClassSync verification code",
                                  "html", "<p>Your ClassSync verification code is:</p><h1>" + otp + "</h1><p>Enter this code to complete registration.</p>"))
                .retrieve().bodyToMono(String.class).block();
        } else {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(smtpFrom);
            message.setTo(to);
            message.setSubject("Your ClassSync verification code");
            message.setText("Your ClassSync verification code is " + otp + ". It expires when you request another code.");
            mailSender.send(message);
        }
    }
}