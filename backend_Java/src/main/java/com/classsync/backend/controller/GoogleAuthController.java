package com.classsync.backend.controller;

import com.classsync.backend.model.User;
import com.classsync.backend.repository.UserRepository;
import com.classsync.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;

@RestController
@SuppressWarnings("null")
public class GoogleAuthController {
    
    @Autowired 
    private UserRepository userRepository;
    
    @Autowired 
    private JwtUtil jwtUtil;
    
    @Value("${app.frontend.url}") 
    private String frontendUrl;

    @GetMapping("/auth/google/callback")
    public void googleCallback(@AuthenticationPrincipal OAuth2User principal, HttpServletResponse response) throws IOException {
        if (principal == null) { 
            response.sendRedirect(frontendUrl + "/#auth_error=google"); 
            return; 
        }

        String email = principal.getAttribute("email");
        if (email == null) { 
            response.sendRedirect(frontendUrl + "/#auth_error=google"); 
            return; 
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(principal.getAttribute("name") != null ? principal.getAttribute("name") : email);
            newUser.setProvider("google");
            newUser.setProviderId(principal.getAttribute("sub"));
            newUser.setIsVerified(true);
            return userRepository.save(newUser);
        });

        if ("manual".equals(user.getProvider())) {
            user.setProvider("google");
            user.setProviderId(principal.getAttribute("sub"));
            user.setIsVerified(true);
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        response.sendRedirect(frontendUrl + "/#auth_token=" + token);
    }
}