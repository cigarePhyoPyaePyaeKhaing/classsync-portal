package com.classsync.backend.repository;

import com.classsync.backend.model.DiscussionMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscussionMessageRepository extends JpaRepository<DiscussionMessage, Long> {
    List<DiscussionMessage> findTop100ByScopeAndSemesterAndSectionOrderByIdDesc(String scope, String semester, String section);
    List<DiscussionMessage> findTop100ByScopeAndSemesterOrderByIdDesc(String scope, String semester);
}