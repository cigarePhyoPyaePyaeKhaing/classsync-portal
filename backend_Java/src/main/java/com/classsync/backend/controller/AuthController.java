package com.classsync.backend.controller;

import com.classsync.backend.model.User;
import com.classsync.backend.repository.UserRepository;
import com.classsync.backend.security.JwtUtil;
import com.classsync.backend.service.EmailService;
import com.classsync.backend.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@SuppressWarnings("null")
public class AuthController {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private EmailService emailService;
    @Autowired private SseService sseService;
    @Value("${app.backend.url}") private String backendUrl;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return userRepository.findById((Long) principal).orElseThrow();
        }
        throw new RuntimeException("Unauthorized");
    }

    private boolean validPassword(String password) {
        return password != null && password.length() >= 8 && password.matches(".*[A-Z].*") && password.matches(".*[a-z].*") && password.matches(".*\\d.*") && password.matches(".*[^A-Za-z0-9].*");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        String tntNo = body.getOrDefault("tntNo", "").trim();
        String password = body.get("password");
        
        if (email.isEmpty() || tntNo.isEmpty() || !validPassword(password)) {
            return ResponseEntity.status(400).body(Map.of("error", "Provide a name, email, TNT number, and a strong password."));
        }

        User existing = userRepository.findByEmail(email).orElseGet(() -> userRepository.findByTntNo(tntNo).orElse(null));
        if (existing != null && (existing.getIsVerified() || !existing.getEmail().equals(email))) {
            return ResponseEntity.status(409).body(Map.of("error", "An account already uses this email or TNT number."));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        User user = existing != null ? existing : new User();
        user.setName(body.get("fullName").trim());
        user.setEmail(email);
        user.setTntNo(tntNo);
        user.setPassword(passwordEncoder.encode(password));
        user.setSemester(body.get("semester"));
        user.setSection(body.get("section"));
        user.setOtp(otp);
        user.setIsVerified(false);
        userRepository.save(user);

        try {
            emailService.sendOtp(email, otp);
            return ResponseEntity.status(existing != null ? 200 : 201).body(Map.of("message", "Verification code sent."));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("error", "Could not send the verification email."));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getIsVerified()) return ResponseEntity.status(404).body(Map.of("error", "No unverified account was found for this email."));
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        userRepository.save(user);
        try {
            emailService.sendOtp(email, otp);
            return ResponseEntity.ok(Map.of("message", "A new verification code was sent."));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("error", "Could not send the verification email."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        String otp = body.getOrDefault("otp", "");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getIsVerified() || !otp.equals(user.getOtp())) {
            return ResponseEntity.status(400).body(Map.of("error", "That verification code is invalid or has already been used."));
        }
        
        user.setIsVerified(true);
        user.setOtp(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Account verified. You can now sign in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.getOrDefault("identifier", "").trim();
        User user = userRepository.findByEmail(identifier.toLowerCase()).orElseGet(() -> userRepository.findByTntNo(identifier).orElse(null));

        if (user == null || user.getPassword() == null || !passwordEncoder.matches(body.get("password"), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email/TNT number or password."));
        }
        if (!user.getIsVerified()) return ResponseEntity.status(403).body(Map.of("error", "Verify your email before signing in."));

        return ResponseEntity.ok(Map.of("user", user, "token", jwtUtil.generateToken(user.getId(), user.getEmail())));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        return ResponseEntity.ok(Map.of("user", getCurrentUser()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        boolean updated = false;
        if(body.containsKey("name")) { user.setName(body.get("name").trim()); updated = true; }
        if(body.containsKey("semester")) { user.setSemester(body.get("semester").trim()); updated = true; }
        if(body.containsKey("section")) { user.setSection(body.get("section").trim()); updated = true; }
        if(body.containsKey("major")) { user.setMajor(body.get("major").trim()); updated = true; }
        if(body.containsKey("phone")) { user.setPhone(body.get("phone").trim()); updated = true; }
        if(body.containsKey("address")) { user.setAddress(body.get("address").trim()); updated = true; }
        if(body.containsKey("bio")) { user.setBio(body.get("bio").trim()); updated = true; }
        
        if (!updated) return ResponseEntity.status(400).body(Map.of("error", "No valid profile fields were supplied."));

        userRepository.save(user);
        sseService.broadcast("profile.updated", user);
        return ResponseEntity.ok(Map.of("data", user));
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("avatar") MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (file.isEmpty() || file.getSize() > 2 * 1024 * 1024 || contentType == null || !contentType.matches("^image/(png|jpe?g|webp)$")) {
            return ResponseEntity.status(400).body(Map.of("error", "Upload a PNG, JPG, or WEBP image no larger than 2 MB."));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "avatar.jpg";

        String filename = "user_" + System.currentTimeMillis() + "_" + originalName.toLowerCase();
        File dest = new File("uploads/" + filename);
        dest.getParentFile().mkdirs();
        file.transferTo(dest);

        User user = getCurrentUser();
        String avatarUrl = backendUrl + "/uploads/" + filename;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("data", Map.of("avatarUrl", avatarUrl)));
    }
}