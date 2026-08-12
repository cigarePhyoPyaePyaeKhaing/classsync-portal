package com.classsync.backend.controller;

import com.classsync.backend.model.User;
import com.classsync.backend.repository.UserRepository;
import com.classsync.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "https://classsync-portal.vercel.app")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private boolean isValidPassword(String password) {
        return password != null 
                && password.length() >= 8 
                && password.matches(".*[A-Z].*") 
                && password.matches(".*[a-z].*") 
                && password.matches(".*\\d.*") 
                && password.matches(".*[^A-Za-z0-9].*");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String fullName = request.get("fullName");
            String email = request.get("email");
            String tntNo = request.get("tntNo");
            String password = request.get("password");
            String semester = request.get("semester");
            String section = request.get("section");

            String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
            if (fullName == null || fullName.trim().isEmpty() || normalizedEmail.isEmpty() || tntNo == null || !isValidPassword(password)) {
                return ResponseEntity.status(400).body(Map.of("error", "Provide a name, email, TNT number, and a strong password (min 8 chars, uppercase, lowercase, number, special char)."));
            }

            String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
            String passwordHash = passwordEncoder.encode(password);

            Optional<User> existingOpt = userRepository.findByEmail(normalizedEmail);
            User user;

            if (existingOpt.isPresent()) {
                user = existingOpt.get();
                if (Boolean.TRUE.equals(user.getIsVerified())) {
                    return ResponseEntity.status(409).body(Map.of("error", "An account already uses this email."));
                }
                user.setName(fullName.trim());
                user.setTntNo(tntNo.trim());
                user.setPassword(passwordHash);
                user.setSemester(semester);
                user.setSection(section);
                user.setOtp(otp);
            } else {
                user = new User();
                user.setName(fullName.trim());
                user.setEmail(normalizedEmail);
                user.setTntNo(tntNo.trim());
                user.setPassword(passwordHash);
                user.setSemester(semester);
                user.setSection(section);
                user.setOtp(otp);
                user.setIsVerified(false);
            }

            userRepository.save(user);

            System.out.println("==========================================");
            System.out.println("VERIFICATION OTP FOR " + normalizedEmail + ": " + otp);
            System.out.println("==========================================");

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Verification code generated and sent. (Check server console for OTP in dev mode)");

            if (existingOpt.isPresent() && Boolean.FALSE.equals(user.getIsVerified())) {
                return ResponseEntity.ok(responseBody);
            } else {
                return ResponseEntity.status(201).body(responseBody);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String normalizedEmail = email != null ? email.trim().toLowerCase() : "";

            Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Account not found."));
            }

            User user = userOpt.get();
            if (user.getOtp() == null || !user.getOtp().equals(otp)) {
                return ResponseEntity.status(400).body(Map.of("error", "That verification code is invalid."));
            }

            user.setIsVerified(true);
            user.setOtp(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Account verified. You can now sign in."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String normalizedEmail = email != null ? email.trim().toLowerCase() : "";

            Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
            if (userOpt.isEmpty() || Boolean.TRUE.equals(userOpt.get().getIsVerified())) {
                return ResponseEntity.status(404).body(Map.of("error", "No unverified account was found for this email."));
            }

            User user = userOpt.get();
            String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
            user.setOtp(otp);
            userRepository.save(user);

            System.out.println("==========================================");
            System.out.println("RESENT OTP FOR " + normalizedEmail + ": " + otp);
            System.out.println("==========================================");

            return ResponseEntity.ok(Map.of("message", "A new verification code was sent."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not resend OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String password = request.get("password");

        if (identifier == null || password == null || identifier.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Identifier and password are required."));
        }

        String trimmedId = identifier.trim();
        // Email သို့မဟုတ် TNT No ဖြင့် အောင်မြင်စွာ ရှာဖွေခြင်း
        Optional<User> userOpt = userRepository.findByEmailOrTntNo(trimmedId.toLowerCase(), trimmedId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email/TNT No or password."));
        }

        User user = userOpt.get();
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email/TNT No or password."));
        }
        if (Boolean.FALSE.equals(user.getIsVerified())) {
            return ResponseEntity.status(403).body(Map.of("error", "Verify your email before signing in."));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getName() != null ? user.getName() : "",
            "email", user.getEmail(),
            "tntNo", user.getTntNo() != null ? user.getTntNo() : "",
            "semester", user.getSemester() != null ? user.getSemester() : "",
            "section", user.getSection() != null ? user.getSection() : "",
            "role", user.getRole() != null ? user.getRole() : "student"
        ));

        return ResponseEntity.ok(response);
    }
}