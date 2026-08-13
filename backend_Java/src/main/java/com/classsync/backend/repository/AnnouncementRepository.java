package com.classsync.backend.repository;
import com.classsync.backend.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findBySemesterAndSectionOrderByIsPinnedDescCreatedAtDesc(String semester, String section);
}