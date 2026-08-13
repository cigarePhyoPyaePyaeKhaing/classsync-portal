package com.classsync.backend.controller;

import com.classsync.backend.model.*;
import com.classsync.backend.repository.*;
import com.classsync.backend.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api")
@SuppressWarnings("null")
public class ApiController {

    @Autowired private SseService sseService;
    @Autowired private UserRepository userRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssignmentSubmissionRepository submissionRepository;
    @Autowired private CalendarEventRepository calendarEventRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private DiscussionMessageRepository discussionRepository;

    private User getScopedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            User user = userRepository.findById((Long) principal).orElseThrow();
            if (user.getSemester() == null || user.getSection() == null) {
                throw new RuntimeException("Complete your semester and section in your profile first.");
            }
            return user;
        }
        throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() { return ResponseEntity.ok(Map.of("status", "ok", "timestamp", java.time.Instant.now())); }

    @GetMapping("/live")
    public SseEmitter live() { return sseService.addEmitter(); }

    @GetMapping("/announcements")
    public ResponseEntity<?> getAnnouncements() {
        try {
            User user = getScopedUser();
            return ResponseEntity.ok(Map.of("data", announcementRepository.findBySemesterAndSectionOrderByIsPinnedDescCreatedAtDesc(user.getSemester(), user.getSection())));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/announcements")
    public ResponseEntity<?> createAnnouncement(@RequestBody Announcement announcement) {
        try {
            User user = getScopedUser();
            if (!"cr".equals(user.getRole())) return ResponseEntity.status(403).body(Map.of("error", "Class Rep permission is required."));
            if (announcement.getTitle() == null || announcement.getBody() == null) return ResponseEntity.status(400).body(Map.of("error", "Title and message are required."));
            
            announcement.setAuthor(user);
            announcement.setSemester(user.getSemester());
            announcement.setSection(user.getSection());
            if (announcement.getCategory() == null) announcement.setCategory("General");
            
            Announcement saved = announcementRepository.save(announcement);
            sseService.broadcast("announcement.created", saved);
            return ResponseEntity.status(201).body(Map.of("data", saved));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getAssignments() {
        try {
            User user = getScopedUser();
            return ResponseEntity.ok(Map.of("data", assignmentRepository.findAssignmentsWithSubmissions(user.getId(), user.getSemester(), user.getSection())));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/assignments/{id}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable Long id) {
        try {
            User user = getScopedUser();
            Assignment assignment = assignmentRepository.findById(id).orElse(null);
            if (assignment == null || !assignment.getSemester().equals(user.getSemester()) || !assignment.getSection().equals(user.getSection())) {
                return ResponseEntity.status(404).body(Map.of("error", "Assignment not found."));
            }

            AssignmentSubmission sub = new AssignmentSubmission();
            sub.setAssignmentId(id);
            sub.setStudentId(user.getId());
            sub.setSubmittedAt(LocalDateTime.now());
            submissionRepository.save(sub);

            Map<String, Object> data = Map.of("assignmentId", id, "studentId", user.getId(), "submittedAt", sub.getSubmittedAt());
            sseService.broadcast("assignment.submitted", data);
            return ResponseEntity.ok(Map.of("data", data));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/calendar-events")
    public ResponseEntity<?> getCalendarEvents() {
        try {
            User user = getScopedUser();
            return ResponseEntity.ok(Map.of("data", calendarEventRepository.findBySemesterAndSectionOrderByEventDateAscEventTimeAsc(user.getSemester(), user.getSection())));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjects() {
        try {
            User user = getScopedUser();
            return ResponseEntity.ok(Map.of("data", subjectRepository.findBySemesterAndSectionOrderByCodeAsc(user.getSemester(), user.getSection())));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance() {
        try {
            User user = getScopedUser();
            return ResponseEntity.ok(Map.of("data", attendanceSessionRepository.findAttendanceWithRecords(user.getId(), user.getSemester(), user.getSection())));
        } catch (RuntimeException e) { return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/discussions/{scope}/messages")
    public ResponseEntity<?> getDiscussions(@PathVariable String scope, @RequestParam(required = false) String semester, @RequestParam(required = false) String section) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof Long)) return ResponseEntity.status(401).build();

        User user = userRepository.findById((Long) principal).orElse(null);
        if (user == null) return ResponseEntity.status(403).body(Map.of("error", "Account not found."));

        if (!"section".equals(scope) && !"semester".equals(scope) || semester == null || ("section".equals(scope) && section == null)) {
            return ResponseEntity.status(403).body(Map.of("error", "A valid discussion channel is required."));
        }
        if (user.getSemester() != null && !user.getSemester().equals(semester)) return ResponseEntity.status(403).body(Map.of("error", "You cannot access another semester discussion."));
        if ("section".equals(scope) && user.getSection() != null && !user.getSection().equals(section)) return ResponseEntity.status(403).body(Map.of("error", "You cannot access another section discussion."));

        List<DiscussionMessage> messages = "section".equals(scope) ?
            discussionRepository.findTop100ByScopeAndSemesterAndSectionOrderByIdDesc(scope, semester, section) :
            discussionRepository.findTop100ByScopeAndSemesterOrderByIdDesc(scope, semester);
        
        java.util.Collections.reverse(messages);
        return ResponseEntity.ok(Map.of("messages", messages));
    }

    @PostMapping("/discussions/{scope}/messages")
    public ResponseEntity<?> postDiscussion(@PathVariable String scope, @RequestBody Map<String, String> body) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof Long)) return ResponseEntity.status(401).build();

        User user = userRepository.findById((Long) principal).orElse(null);
        if (user == null) return ResponseEntity.status(403).body(Map.of("error", "Account not found."));

        String semester = body.getOrDefault("semester", "").trim();
        String section = body.getOrDefault("section", "").trim();
        String text = body.getOrDefault("body", "").trim();

        if (!"section".equals(scope) && !"semester".equals(scope) || semester.isEmpty() || ("section".equals(scope) && section.isEmpty())) {
            return ResponseEntity.status(403).body(Map.of("error", "A valid discussion channel is required."));
        }
        if (user.getSemester() != null && !user.getSemester().equals(semester)) return ResponseEntity.status(403).body(Map.of("error", "You cannot access another semester discussion."));
        if ("section".equals(scope) && user.getSection() != null && !user.getSection().equals(section)) return ResponseEntity.status(403).body(Map.of("error", "You cannot access another section discussion."));
        if (text.isEmpty() || text.length() > 1000) return ResponseEntity.status(400).body(Map.of("error", "Message must contain 1 to 1000 characters."));

        DiscussionMessage msg = new DiscussionMessage();
        msg.setScope(scope);
        msg.setSemester(semester);
        msg.setSection("section".equals(scope) ? section : null);
        msg.setBody(text);
        msg.setSender(user);
        
        DiscussionMessage saved = discussionRepository.save(msg);
        
        Map<String, Object> messageDto = Map.of(
            "id", saved.getId(), "scope", saved.getScope(), "semester", saved.getSemester(), "section", saved.getSection(),
            "body", saved.getBody(), "created_at", saved.getCreatedAt(), "sender_id", user.getId(), "sender_name", user.getName(), "avatar_url", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        );
        sseService.broadcast("discussion.message", messageDto);
        return ResponseEntity.status(201).body(Map.of("message", messageDto));
    }
}