package com.classsync.backend.model;
import jakarta.persistence.*; import lombok.Data; import java.time.LocalDateTime;
@Entity @Table(name = "announcements") @Data
public class Announcement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String body;
    @Column(nullable = false, length = 30) private String category = "General";
    @Column(name = "subject_id") private Long subjectId;
    @Column(nullable = false, length = 50) private String semester;
    @Column(nullable = false, length = 50) private String section;
    @Column(name = "is_urgent", nullable = false) private Boolean isUrgent = false;
    @Column(name = "is_pinned", nullable = false) private Boolean isPinned = false;
    @ManyToOne @JoinColumn(name = "author_id", nullable = false) private User author;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at") private LocalDateTime updatedAt = LocalDateTime.now();
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}