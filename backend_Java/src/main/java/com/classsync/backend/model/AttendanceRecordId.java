package com.classsync.backend.model;
import lombok.Data; 
import java.io.Serializable;

@Data 
public class AttendanceRecordId implements Serializable { 
    private Long sessionId; 
    private Long studentId; 
}