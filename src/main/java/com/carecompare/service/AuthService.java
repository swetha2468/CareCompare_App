package com.carecompare.service;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;
import com.carecompare.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InsurancePlanService insurancePlanService;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public User register(User user) {
        logger.info("Registering user: {}", user.getUsername());
        
        // Check if username or email already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            logger.warn("Username already exists: {}", user.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Email already exists: {}", user.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Remove any potentially set ID to let the database generate it
        user.setId(null);
        
        // Associate with insurance plan if policy number is provided
        if (user.getPolicyNumber() != null && !user.getPolicyNumber().isEmpty()) {
            Optional<InsurancePlan> planOptional = insurancePlanService.findByPolicyNumber(user.getPolicyNumber());
            if (planOptional.isPresent()) {
                InsurancePlan plan = planOptional.get();
                user.setInsurancePlan(plan);
                logger.info("Associated user with insurance plan: {}", plan.getName());
            }
        }
        
        logger.info("Saving user to database");
        return userRepository.save(user);
    }

    public String login(String usernameOrEmail, String password) {
        logger.info("Attempting login for: {}", usernameOrEmail);
        User user = findByUsernameOrEmail(usernameOrEmail);
        
        return validateCredentialsAndGenerateToken(user.getUsername(), password);
    }
    
    /**
     * Validates user credentials and generates a JWT token
     * @param username The username to validate
     * @param password The password to validate
     * @return A JWT token if validation is successful
     * @throws IllegalArgumentException if credentials are invalid
     */
    public String validateCredentialsAndGenerateToken(String username, String password) {
        User user = findByUsername(username);
        
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        
        if (passwordEncoder.matches(password, user.getPassword())) {
            return jwtUtil.generateToken(user.getUsername());
        }
        
        throw new IllegalArgumentException("Invalid credentials");
    }
    
    public User findByUsernameOrEmail(String usernameOrEmail) {
        logger.info("Searching for user with username or email: {}", usernameOrEmail);
        Optional<User> user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail));
        return user.orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    /**
     * Find user by policy number
     * @param policyNumber The policy number to search for
     * @return The user with the given policy number, or null if not found
     */
    public User findByPolicyNumber(String policyNumber) {
        logger.info("Searching for user with policy number: {}", policyNumber);
        return userRepository.findByPolicyNumber(policyNumber);
    }
}