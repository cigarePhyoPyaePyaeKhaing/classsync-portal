package com.classsync.backend.model;
import jakarta.persistence.*; import lombok.Data; import java.time.LocalDateTime;

@Entity @Table(name = "users") @Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(unique = true) private String email;
    @Column(unique = true, name = "tnt_no", length = 50) private String tntNo;
    private String password;
    @Column(length = 50) private String semester;
    @Column(length = 50) private String section;
    @Column(length = 100) private String major;
    @Column(length = 50) private String phone;
    @Column(columnDefinition = "TEXT") private String address;
    @Column(columnDefinition = "TEXT") private String bio;
    @Column(columnDefinition = "TEXT", name = "avatar_url") private String avatarUrl;
    @Column(length = 50) private String provider = "manual";
    @Column(name = "provider_id") private String providerId;
    @Column(length = 10) private String otp;
    @Column(name = "is_verified") private Boolean isVerified = false;
    @Column(nullable = false) private String role = "student";
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
}