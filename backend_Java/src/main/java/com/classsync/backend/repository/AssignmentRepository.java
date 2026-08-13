package com.classsync.backend.repository;
import com.classsync.backend.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    @Query("SELECT a, s.submittedAt, s.grade, s.feedback FROM Assignment a LEFT JOIN AssignmentSubmission s ON a.id = s.assignmentId AND s.studentId = :studentId WHERE a.semester = :semester AND a.section = :section ORDER BY a.dueAt ASC")
    List<Object[]> findAssignmentsWithSubmissions(@Param("studentId") Long studentId, @Param("semester") String semester, @Param("section") String section);
}