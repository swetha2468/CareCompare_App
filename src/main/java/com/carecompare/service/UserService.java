package com.carecompare.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;

/**
 * Service class responsible for handling user-related business logic.
 * This includes user registration, authentication, and password encryption.
 */
@Service
public class UserService {

    private final UserRepository userRepository;  // Repository to interact with the database
    private final BCryptPasswordEncoder passwordEncoder; // Encoder for hashing passwords

    /**
     * Constructor-based dependency injection of UserRepository.
     * Initializes the password encoder.
     *
     * @param userRepository Repository for user-related database operations.
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); // Instantiating password encoder
    }

    /**
     * Registers a new user in the system.
     * 
     * Steps:
     * 1. Checks if the user already exists based on the email.
     * 2. If not, hashes the password using BCrypt.
     * 3. Saves the new user in the database.
     *
     * @param user The user object containing registration details.
     * @return true if registration is successful, false if the email already exists.
     */
    public boolean registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return false; // User with this email already exists
        }

        // Encrypt the password before saving
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        // Save the user into the database
        userRepository.save(user);
        return true; // Registration successful
    }

    /**
     * Authenticates a user during login.
     * 
     * Steps:
     * 1. Retrieves user details based on the provided email.
     * 2. If the user exists, compares the provided password with the stored hashed password.
     * 3. Returns true if authentication is successful, false otherwise.
     *
     * @param email The email provided by the user during login.
     * @param password The plaintext password entered by the user.
     * @return true if authentication is successful, false otherwise.
     */
    public boolean authenticateUser(String email, String password) {
        return userRepository.findByEmail(email)
                .map(user -> passwordEncoder.matches(password, user.getPasswordHash())) // Match plaintext password with hashed password
                .orElse(false); // Return false if user not found
    }
}
