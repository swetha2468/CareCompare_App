package com.carecompare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carecompare.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId); 
}