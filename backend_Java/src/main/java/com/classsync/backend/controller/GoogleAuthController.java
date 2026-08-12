package com.classsync.backend.controller;

import com.classsync.backend.model.User;
import com.classsync.backend.repository.UserRepository;
import com.classsync.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
public class GoogleAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/auth/google/success")
    public RedirectView handleGoogleSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return new RedirectView("https://classsync-portal.vercel.app/login?error=unauthorized");
        }

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        if (email == null) {
            return new RedirectView("https://classsync-portal.vercel.app/login?error=email_not_found");
        }

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(normalizedEmail);
            newUser.setName(name != null ? name : "Google User");
            newUser.setIsVerified(true);
            newUser.setRole("student");
            newUser.setTntNo("TNT-0000");
            newUser.setSemester("Semester 1");
            newUser.setSection("A");
            return userRepository.save(newUser);
        });

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        try {
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8.toString());
            String encodedName = URLEncoder.encode(user.getName() != null ? user.getName() : "", StandardCharsets.UTF_8.toString());
            String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8.toString());
            String encodedTnt = URLEncoder.encode(user.getTntNo() != null ? user.getTntNo() : "", StandardCharsets.UTF_8.toString());
            String encodedSemester = URLEncoder.encode(user.getSemester() != null ? user.getSemester() : "", StandardCharsets.UTF_8.toString());
            String encodedSection = URLEncoder.encode(user.getSection() != null ? user.getSection() : "", StandardCharsets.UTF_8.toString());
            String encodedRole = URLEncoder.encode(user.getRole() != null ? user.getRole() : "student", StandardCharsets.UTF_8.toString());

            String frontendRedirectUrl = "https://classsync-portal.vercel.app/dashboard?token=" + encodedToken +
                    "&name=" + encodedName +
                    "&email=" + encodedEmail +
                    "&tntNo=" + encodedTnt +
                    "&semester=" + encodedSemester +
                    "&section=" + encodedSection +
                    "&role=" + encodedRole;

            return new RedirectView(frontendRedirectUrl);
        } catch (Exception e) {
            return new RedirectView("https://classsync-portal.vercel.app/login?error=redirect_failed");
        }
    }
}