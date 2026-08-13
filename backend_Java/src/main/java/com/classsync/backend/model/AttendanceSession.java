package com.classsync.backend.model;
import jakarta.persistence.*; 
import lombok.Data; 
import java.time.LocalDate; 
import java.time.LocalDateTime;

@Entity 
@Table(name = "attendance_sessions", uniqueConstraints = {@UniqueConstraint(columnNames = {"subject_id", "session_date", "semester", "section"})}) 
@Data
public class AttendanceSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "subject_id", nullable = false) private Long subjectId;
    @Column(name = "session_date", nullable = false) private LocalDate sessionDate;
    @Column(nullable = false, length = 50) private String semester;
    @Column(nullable = false, length = 50) private String section;
    @Column(name = "created_by", nullable = false) private Long createdBy;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
}