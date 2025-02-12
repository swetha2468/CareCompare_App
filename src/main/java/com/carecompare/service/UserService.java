package com.carecompare.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;
import com.carecompare.util.JwtUtil;

/**
 * Service class responsible for handling user-related business logic.
 * This includes user registration, authentication, and password encryption.
 */
@Service
public class UserService {

    private final UserRepository userRepository;  // Repository to interact with the database
    private final BCryptPasswordEncoder passwordEncoder; // Encoder for hashing passwords
    private final JwtUtil jwtUtil; // Utility for generating JWT tokens

    /**
     * Constructor-based dependency injection of UserRepository and JwtUtil.
     * Initializes the password encoder.
     *
     * @param userRepository Repository for user-related database operations.
     * @param jwtUtil Utility class for handling JWT token generation and validation.
     */
    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); // Instantiating password encoder
        this.jwtUtil = jwtUtil;
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
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return null; // Return null if user already exists
        }
        // Encrypt the password before saving
    user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

    // Save and return the user
    return userRepository.save(user);
}
    /**
     * Authenticates a user during login and generates a JWT token upon successful login.
     * 
     * Steps:
     * 1. Retrieves user details based on the provided email.
     * 2. If the user exists, compares the provided password with the stored hashed password.
     * 3. If authentication is successful, generates and returns a JWT token.
     * 4. Returns null if authentication fails.
     *
     * @param email The email provided by the user during login.
     * @param password The plaintext password entered by the user.
     * @return JWT token if authentication is successful, null otherwise.
     */
    public String authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPasswordHash())) {
                return jwtUtil.generateToken(email); // Generate JWT Token
            }
        }
        return null; // Authentication failed
    }
}
