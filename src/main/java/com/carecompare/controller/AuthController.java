package com.carecompare.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.dto.UserRegistrationDto;
import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.security.JwtUtil;
import com.carecompare.service.AuthService;
import com.carecompare.service.InsurancePlanService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;
    
    @Autowired
    private InsurancePlanService insurancePlanService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDto registrationDto) {
        try {
            logger.info("Received registration request: {}", registrationDto.getUsername());
            
            // Validate policy number if provided
            if (registrationDto.getPolicyNumber() != null && !registrationDto.getPolicyNumber().isEmpty()) {
                Optional<InsurancePlan> planOptional = insurancePlanService.findByPolicyNumber(registrationDto.getPolicyNumber());
                if (!planOptional.isPresent()) {
                    logger.warn("Invalid policy number provided: {}", registrationDto.getPolicyNumber());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid policy number"));
                }
                logger.info("Valid policy number found: {}", registrationDto.getPolicyNumber());
            }
            
            // Check required fields
            if (registrationDto.getUsername() == null || registrationDto.getUsername().isEmpty() ||
                registrationDto.getPassword() == null || registrationDto.getPassword().isEmpty() ||
                registrationDto.getEmail() == null || registrationDto.getEmail().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Username, password, and email are required"));
            }
            
            // Convert DTO to User entity
            User user = new User();
            user.setUsername(registrationDto.getUsername());
            user.setPassword(registrationDto.getPassword());
            user.setEmail(registrationDto.getEmail());
            // Only set policy number if provided
            if (registrationDto.getPolicyNumber() != null && !registrationDto.getPolicyNumber().isEmpty()) {
                user.setPolicyNumber(registrationDto.getPolicyNumber());
            }
            
            User registeredUser = authService.register(user);
            String token = jwtUtil.generateToken(registeredUser.getUsername());
            
            logger.info("User registered successfully: {}", registeredUser.getUsername());
            return ResponseEntity.ok(Map.of(
                "message", "User registered successfully", 
                "user", Map.of(
                    "id", registeredUser.getId(),
                    "username", registeredUser.getUsername(),
                    "email", registeredUser.getEmail(),
                    "policyNumber", registeredUser.getPolicyNumber() != null ? registeredUser.getPolicyNumber() : ""
                ),
                "token", token
            ));
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            logger.info("Received login credentials: {}", credentials);
            
            String usernameOrEmail = credentials.get("username"); // Accept username or email
            String policyNumber = credentials.get("policyNumber"); 
            String password = credentials.get("password");
            
            if (password == null) {
                throw new IllegalArgumentException("Password is missing");
            }
            
            // Determine login method based on provided credentials
            User user;
            String token;
            
            if (policyNumber != null && !policyNumber.isEmpty()) {
                // Policy number login flow
                logger.info("Attempting login with policy number: {}", policyNumber);
                user = authService.findByPolicyNumber(policyNumber);
                
                if (user == null) {
                    logger.warn("No user found with policy number: {}", policyNumber);
                    return ResponseEntity.status(401).body(Map.of("error", "Invalid policy number"));
                }
                
                // Validate password
                token = authService.validateCredentialsAndGenerateToken(user.getUsername(), password);
            } else if (usernameOrEmail != null && !usernameOrEmail.isEmpty()) {
                // Traditional username/email login flow
                logger.info("Attempting login with username/email: {}", usernameOrEmail);
                token = authService.login(usernameOrEmail, password); 
                user = authService.findByUsernameOrEmail(usernameOrEmail);
            } else {
                logger.warn("Login attempt without username, email, or policy number");
                return ResponseEntity.status(401).body(Map.of("error", "Username/email or policy number is required"));
            }
            
            // Return user data with token
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "policyNumber", user.getPolicyNumber() != null ? user.getPolicyNumber() : ""
                )
            ));
        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage(), e);
            return ResponseEntity.status(401).body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            try {
                User user = authService.findByUsername(auth.getName());
                return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "policyNumber", user.getPolicyNumber() != null ? user.getPolicyNumber() : ""
                ));
            } catch (Exception e) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Extract username from token
                String username = jwtUtil.extractUsername(token);
                if (username != null) {
                    // Load UserDetails for validation
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Use the enhanced refreshToken method from JwtUtil that validates against UserDetails
                    String refreshedToken = jwtUtil.refreshToken(token, userDetails);
                    if (refreshedToken != null) {
                        // Return the new token along with a refresh token
                        String refreshToken = jwtUtil.generateRefreshToken(username);
                        
                        Map<String, String> response = new HashMap<>();
                        response.put("token", refreshedToken);
                        response.put("refreshToken", refreshToken);
                        logger.info("Token refreshed successfully for user: {}", username);
                        return ResponseEntity.ok(response);
                    }
                }
            } catch (Exception e) {
                logger.error("Error refreshing token", e);
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Invalid token"));
    }

    /**
     * Test endpoint to verify token authentication
     */
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth() {
        // Get the authenticated user from SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !(authentication instanceof AnonymousAuthenticationToken)) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Authentication successful");
            response.put("username", authentication.getName());
            response.put("authorities", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Not authenticated"));
    }
}