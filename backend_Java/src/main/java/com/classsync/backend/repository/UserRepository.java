package com.classsync.backend.repository;

import com.classsync.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    // Email သို့မဟုတ် TNT No ဖြင့် ရှာဖွေရန်
    Optional<User> findByEmailOrTntNo(String email, String tntNo);
}