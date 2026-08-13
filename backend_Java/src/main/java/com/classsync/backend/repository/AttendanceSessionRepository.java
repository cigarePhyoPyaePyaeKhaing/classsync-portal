package com.classsync.backend.repository;
import com.classsync.backend.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    @Query("SELECT s.id, s.sessionDate, s.subjectId, r.status FROM AttendanceSession s LEFT JOIN AttendanceRecord r ON s.id = r.sessionId AND r.studentId = :studentId WHERE s.semester = :semester AND s.section = :section ORDER BY s.sessionDate DESC")
    List<Object[]> findAttendanceWithRecords(@Param("studentId") Long studentId, @Param("semester") String semester, @Param("section") String section);
}