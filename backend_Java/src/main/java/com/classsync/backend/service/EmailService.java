package com.classsync.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:phyopyaekhaing2006@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:ClassSync Portal}")
    private String senderName;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from:ClassSync <onboarding@resend.dev>}")
    private String resendFrom;

    public void sendOtpEmail(String recipientEmail, String otp) throws Exception {
        if (brevoApiKey != null && !brevoApiKey.isEmpty()) {
            sendViaBrevo(recipientEmail, otp);
        } else if (resendApiKey != null && !resendApiKey.isEmpty()) {
            sendViaResend(recipientEmail, otp);
        } else {
            System.out.println("==========================================");
            System.out.println("NO EMAIL API KEY SET. OTP FOR " + recipientEmail + ": " + otp);
            System.out.println("==========================================");
        }
    }

    private void sendViaBrevo(String recipientEmail, String otp) throws Exception {
        String jsonBody = "{"
                + "\"sender\": {\"name\": \"" + senderName + "\", \"email\": \"" + senderEmail + "\"},"
                + "\"to\": [{\"email\": \"" + recipientEmail + "\"}],"
                + "\"subject\": \"Your ClassSync verification code\","
                + "\"textContent\": \"Your ClassSync verification code is " + otp + ". Enter this code to complete registration.\","
                + "\"htmlContent\": \"<p>Your ClassSync verification code is:</p><h1>" + otp + "</h1><p>Enter this code to complete registration.</p>\""
                + "}";

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", brevoApiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 201 && response.statusCode() != 200) {
            throw new RuntimeException("Brevo API returned status " + response.statusCode() + ": " + response.body());
        }
    }

    private void sendViaResend(String recipientEmail, String otp) throws Exception {
        String jsonBody = "{"
                + "\"from\": \"" + resendFrom + "\","
                + "\"to\": [\"" + recipientEmail + "\"],"
                + "\"subject\": \"Your ClassSync verification code\","
                + "\"html\": \"<p>Your ClassSync verification code is:</p><h1>" + otp + "</h1><p>Enter this code to complete registration.</p>\""
                + "}";

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200 && response.statusCode() != 201) {
            throw new RuntimeException("Resend API returned status " + response.statusCode() + ": " + response.body());
        }
    }
}