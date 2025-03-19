package com.carecompare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.dto.LoginRequest;
import com.carecompare.model.User;
import com.carecompare.service.UserService;

import jakarta.validation.Valid;

/**
 * REST Controller for handling user authentication and registration.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * User Registration Endpoint.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getName() == null) {
            return ResponseEntity.badRequest().body("Invalid request: missing fields.");
        }

        User newUser = userService.registerUser(user);
        if (newUser != null) {
            return ResponseEntity.ok("User registered successfully");
        } else {
            return ResponseEntity.badRequest().body("User already exists");
        }
    }

    /**
     * User Login Endpoint.
     */
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        String jwtToken = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (jwtToken != null) {
            return ResponseEntity.ok(jwtToken);
        } else {
            return ResponseEntity.status(401).body("Invalid email or password.");
        }
    }
}
