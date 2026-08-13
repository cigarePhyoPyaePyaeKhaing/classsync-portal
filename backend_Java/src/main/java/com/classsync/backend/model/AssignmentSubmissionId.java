package com.classsync.backend.model;
import lombok.Data; 
import java.io.Serializable;

@Data 
public class AssignmentSubmissionId implements Serializable { 
    private Long assignmentId; 
    private Long studentId; 
}