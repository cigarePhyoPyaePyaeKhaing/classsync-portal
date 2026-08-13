package com.classsync.backend.model;
import jakarta.persistence.*; 
import lombok.Data; 
import java.time.LocalDateTime;

@Entity 
@Table(name = "subjects", uniqueConstraints = {@UniqueConstraint(columnNames = {"code", "semester", "section"})}) 
@Data
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 40) private String code;
    @Column(nullable = false) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    private String lecturer;
    @Column(length = 80) private String room;
    @Column(nullable = false, length = 50) private String semester;
    @Column(nullable = false, length = 50) private String section;
    @Column(name = "created_by", nullable = false) private Long createdBy;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt = LocalDateTime.now();
}