package com.classsync.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "ok", "timestamp", java.time.Instant.now()));
    }
    
    @GetMapping("/")
    public ResponseEntity<?> index() {
        return ResponseEntity.ok(Map.of("name", "ClassSync API", "status", "ok"));
    }
}