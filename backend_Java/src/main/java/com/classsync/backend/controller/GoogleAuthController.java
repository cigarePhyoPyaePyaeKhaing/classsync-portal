package com.classsync.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class GoogleAuthController {

    @GetMapping("/auth/google/success")
    public RedirectView handleGoogleSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return new RedirectView("https://classsync-portal.vercel.app/login?error=unauthorized");
        }

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        // Frontend သို့ Redirect လုပ်ခြင်း
        String frontendRedirectUrl = "https://classsync-portal.vercel.app/dashboard?email=" + email + "&name=" + name;
        return new RedirectView(frontendRedirectUrl);
    }
}