package com.classsync.backend.repository;
import com.classsync.backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySemesterAndSectionOrderByCodeAsc(String semester, String section);
}