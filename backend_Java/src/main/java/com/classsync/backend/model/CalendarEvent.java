package com.classsync.backend.model;
import jakarta.persistence.*; 
import lombok.Data; 
import java.time.LocalDate; 
import java.time.LocalTime; 
import java.time.LocalDateTime;

@Entity 
@Table(name = "calendar_events") 
@Data
public class CalendarEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(nullable = false, length = 30) private String category = "Event";
    @Column(name = "event_date", nullable = false) private LocalDate eventDate;
    @Column(name = "event_time") private LocalTime eventTime;
    @Column(nullable = false, length = 50) private String semester;
    @Column(nullable = false, length = 50) private String section;
    @Column(name = "created_by", nullable = false) private Long createdBy;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
}