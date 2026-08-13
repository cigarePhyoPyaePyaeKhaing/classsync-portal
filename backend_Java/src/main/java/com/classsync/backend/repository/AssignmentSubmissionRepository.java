package com.classsync.backend.repository;
import com.classsync.backend.model.AssignmentSubmission;
import com.classsync.backend.model.AssignmentSubmissionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, AssignmentSubmissionId> {
}