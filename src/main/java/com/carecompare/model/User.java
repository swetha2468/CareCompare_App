package com.carecompare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity representing a user in the system.
 * Maps to the "users" table in the database.
 */
@Entity
@Table(name = "users") // Ensures mapping to the correct database table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incremented primary key
    @Column(name = "user_id") // Matches schema.sql column
    private Long userId;

    @Column(name = "name", nullable = false) // Ensures a name is always provided
    private String name;

    @Column(name = "email", unique = true, nullable = false) // Unique constraint to prevent duplicate emails
    private String email;

    @Column(name = "password_hash", nullable = false) // Stores hashed password
    private String passwordHash;
}
