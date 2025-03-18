package com.carecompare.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * @return The registered user if successful, null if user already exists.
     */
    @Transactional
    public User registerUser(User user) {
        // Validate required fields before processing
        if (user.getEmail() == null || user.getPassword() == null || user.getName() == null) {
            throw new IllegalArgumentException("Missing required fields: email, password, or name.");
        }

        // Check if the user already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return null; // User already exists
        }

        // Hash the password before storing in the database
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

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
            if (passwordEncoder.matches(password, user.getPassword())) {
                return jwtUtil.generateToken(email); // Generate JWT Token
            }
        }
        return null; // Authentication failed
    }
}
