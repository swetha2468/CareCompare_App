package com.carecompare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carecompare.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email); 
    User findByPolicyNumber(String policyNumber);
}