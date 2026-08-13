package com.classsync.backend.model;
import jakarta.persistence.*; 
import lombok.Data; 
import java.time.LocalDateTime; 
import java.math.BigDecimal;

@Entity 
@Table(name = "assignment_submissions") 
@Data
@IdClass(AssignmentSubmissionId.class)
public class AssignmentSubmission {
    @Id @Column(name = "assignment_id") private Long assignmentId;
    @Id @Column(name = "student_id") private Long studentId;
    @Column(name = "submitted_at") private LocalDateTime submittedAt = LocalDateTime.now();
    @Column(precision = 5, scale = 2) private BigDecimal grade;
    @Column(columnDefinition = "TEXT") private String feedback;
}