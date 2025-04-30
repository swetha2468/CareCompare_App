package com.carecompare.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.dto.UserRegistrationDto;
import com.carecompare.dto.UserResponseDto;
import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.service.InsurancePlanService;
import com.carecompare.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private InsurancePlanService insurancePlanService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        try {
            // Validate policy number
            if (registrationDto.getPolicyNumber() != null && !registrationDto.getPolicyNumber().isEmpty()) {
                Optional<InsurancePlan> planOptional = insurancePlanService.findByPolicyNumber(registrationDto.getPolicyNumber());
                if (!planOptional.isPresent()) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Invalid policy number");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            }
            
            // Convert DTO to User entity
            User user = new User();
            user.setUsername(registrationDto.getUsername());
            user.setPassword(registrationDto.getPassword());
            user.setEmail(registrationDto.getEmail());
            user.setPolicyNumber(registrationDto.getPolicyNumber());
            
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(new UserResponseDto(registeredUser));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/policy/{policyNumber}")
    public ResponseEntity<?> getUserByPolicyNumber(@PathVariable String policyNumber) {
        try {
            User user = userService.findByPolicyNumber(policyNumber);
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found with policy number: " + policyNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            return ResponseEntity.ok(new UserResponseDto(user));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(new UserResponseDto(user));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User existingUser = userService.findById(id);
            if (existingUser == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Validate policy number
            if (user.getPolicyNumber() != null && !user.getPolicyNumber().isEmpty()) {
                Optional<InsurancePlan> planOptional = insurancePlanService.findByPolicyNumber(user.getPolicyNumber());
                if (!planOptional.isPresent()) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Invalid policy number");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            }
            
            user.setId(id);
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(new UserResponseDto(updatedUser));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Assign an insurance plan to a user and generate a policy number
     * @param userId The user ID
     * @param planId The insurance plan ID
     * @return ResponseEntity with updated user data
     */
    @PostMapping("/{userId}/assign-insurance")
    public ResponseEntity<?> assignInsurancePlan(@PathVariable Long userId, @RequestBody Map<String, Long> requestBody) {
        try {
            // Log request info
            System.out.println("Received assign-insurance request for userId: " + userId + ", data: " + requestBody);
            
            Long planId = requestBody.get("planId");
            if (planId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan ID is required"));
            }
            
            // Check if user exists
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found with id: " + userId));
            }
            
            // Check if plan exists
            Optional<InsurancePlan> planOptional = insurancePlanService.findById(planId);
            if (!planOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Insurance plan not found with id: " + planId));
            }
            
            InsurancePlan plan = planOptional.get();
            
            // Generate a policy number
            String policyNumber;
            if (user.getInsurancePlan() == null || !user.getInsurancePlan().getId().equals(planId)) {
                // Only generate a new policy number if the plan is different
                policyNumber = insurancePlanService.generatePolicyNumber(planId);
            } else {
                // Keep existing policy number if same plan
                policyNumber = user.getPolicyNumber();
            }
            
            // Create a new user object with just the updated fields
            User updatedUserFields = new User();
            updatedUserFields.setId(userId);
            updatedUserFields.setInsurancePlan(plan);
            updatedUserFields.setPolicyNumber(policyNumber);
            
            // Update the user
            User updatedUser = userService.updateUser(updatedUserFields);
            
            // Create a response with all needed user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", updatedUser.getId());
            userData.put("username", updatedUser.getUsername());
            userData.put("email", updatedUser.getEmail());
            userData.put("policyNumber", updatedUser.getPolicyNumber());
            
            // Include insurance plan details
            if (updatedUser.getInsurancePlan() != null) {
                Map<String, Object> planData = new HashMap<>();
                planData.put("id", updatedUser.getInsurancePlan().getId());
                planData.put("name", updatedUser.getInsurancePlan().getName());
                planData.put("provider", updatedUser.getInsurancePlan().getProvider());
                planData.put("coverage", updatedUser.getInsurancePlan().getCoverage());
                userData.put("insurancePlan", planData);
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Insurance plan assigned successfully",
                "user", userData
            ));
        } catch (Exception e) {
            
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to assign insurance plan: " + e.getMessage()));
        }
    }

    /**
     * Update the user profile with the form data from the frontend
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "You must be logged in to update your profile"));
            }
            
            // Get the current user
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
            
            // Update user fields
            if (profileData.containsKey("email")) {
                user.setEmail(profileData.get("email"));
            }
            
            // Create or update user profile
            userService.updateUserProfile(user, profileData);
            
            // Create response with all user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("firstName", profileData.get("firstName"));
            userData.put("lastName", profileData.get("lastName"));
            userData.put("phoneNumber", profileData.get("phoneNumber"));
            userData.put("address", profileData.get("address"));
            userData.put("dateOfBirth", profileData.get("dateOfBirth"));
            
            if (user.getPolicyNumber() != null) {
                userData.put("policyNumber", user.getPolicyNumber());
            }
            
            if (user.getInsurancePlan() != null) {
                Map<String, Object> planData = new HashMap<>();
                planData.put("id", user.getInsurancePlan().getId());
                planData.put("name", user.getInsurancePlan().getName());
                planData.put("provider", user.getInsurancePlan().getProvider());
                planData.put("coverage", user.getInsurancePlan().getCoverage());
                userData.put("insurancePlan", planData);
            }
            
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }
} 