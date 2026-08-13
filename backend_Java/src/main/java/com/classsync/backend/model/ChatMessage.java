package com.classsync.backend.model;
import jakarta.persistence.*; import lombok.Data; import java.time.LocalDateTime;

@Entity @Table(name = "chat_messages") @Data
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String sender;
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
}