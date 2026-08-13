package com.classsync.backend.repository;
import com.classsync.backend.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findBySemesterAndSectionOrderByEventDateAscEventTimeAsc(String semester, String section);
}