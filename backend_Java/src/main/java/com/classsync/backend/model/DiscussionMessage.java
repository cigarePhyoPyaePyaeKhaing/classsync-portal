package com.classsync.backend.model;
import jakarta.persistence.*; import lombok.Data; import java.time.LocalDateTime;

@Entity @Table(name = "discussion_messages", indexes = {@Index(columnList = "scope, semester, section, id")}) @Data
public class DiscussionMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String scope;
    @Column(nullable = false, length = 50) private String semester;
    @Column(length = 50) private String section;
    @ManyToOne @JoinColumn(name = "sender_id", nullable = false) private User sender;
    @Column(nullable = false, length = 1000) private String body;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
}