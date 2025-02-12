package com.carecompare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.model.User;
import com.carecompare.service.UserService;

/**
 * REST Controller for handling user authentication and registration.
 * Manages user sign-up and login endpoints.
 */
@RestController
@RequestMapping("/auth") // Base URL for authentication-related endpoints
public class AuthController {

    private final UserService userService; // Service layer for user operations

    /**
     * Constructor-based dependency injection for UserService.
     * 
     * @param userService Service handling user authentication and registration.
     */
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint to register a new user.
     * 
     * @param user JSON request body containing user details and optional insurance plans.
     * @return ResponseEntity indicating success or failure of registration.
     */
    @PostMapping("/register")
        public ResponseEntity<?> registerUser(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);
    
        if (registeredUser != null) {
            return ResponseEntity.ok(registeredUser); // Return user data upon successful registration
        } else {
            return ResponseEntity.badRequest().body("User with this email already exists.");
    }
}


    /**
     * Endpoint to authenticate a user during login and return a JWT token.
     * 
     * @param email User email (sent as a request parameter).
     * @param password User password (sent as a request parameter).
     * @return ResponseEntity containing a JWT token if authentication is successful, otherwise an error message.
     */
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestParam String email, @RequestParam String password) {
        String jwtToken = userService.authenticateUser(email, password);
        if (jwtToken != null) {
            return ResponseEntity.ok(jwtToken); // Return JWT token instead of plain success message
        } else {
            return ResponseEntity.status(401).body("Invalid email or password.");
        }
    }
}
