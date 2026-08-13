package com.classsync.backend.model;
import jakarta.persistence.*; 
import lombok.Data; 
import java.time.LocalDateTime;

@Entity 
@Table(name = "assignments") 
@Data
public class Assignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "subject_id") private Long subjectId;
    @Column(nullable = false, length = 50) private String semester;
    @Column(nullable = false, length = 50) private String section;
    @Column(name = "due_at", nullable = false) private LocalDateTime dueAt;
    @Column(nullable = false) private String priority = "Medium";
    @Column(name = "created_by", nullable = false) private Long createdBy;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
}