package com.carecompare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.carecompare.model.User;

/**
 * Repository interface for user-related database operations.
 * Uses Spring Data JPA to perform CRUD operations on the "users" table.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by email.
     * 
     * @param email The email of the user to search for.
     * @return An Optional containing the found user, or empty if no match.
     */
    Optional<User> findByEmail(String email);
}
