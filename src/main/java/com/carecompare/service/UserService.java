package com.carecompare.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InsurancePlanService insurancePlanService;

    public User findById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }
    
    public User findByPolicyNumber(String policyNumber) {
        return userRepository.findByPolicyNumber(policyNumber);
    }
    
    public User registerUser(User user) {
        // Validate the policy number and associate with insurance plan
        if (user.getPolicyNumber() != null && !user.getPolicyNumber().isEmpty()) {
            Optional<InsurancePlan> planOptional = insurancePlanService.findByPolicyNumber(user.getPolicyNumber());
            if (planOptional.isPresent()) {
                user.setInsurancePlan(planOptional.get());
            }
        }
        return userRepository.save(user);
    }
    
    public User updateUser(User user) {
        // Check if user exists first to avoid null pointer exceptions
        User existingUser = findById(user.getId());
        if (existingUser == null) {
            throw new RuntimeException("User not found with id: " + user.getId());
        }
        
        // Only update fields that were provided and not null
        if (user.getUsername() != null) {
            existingUser.setUsername(user.getUsername());
        }
        
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        
        // Handle insurance plan and policy number update
        if (user.getInsurancePlan() != null) {
            existingUser.setInsurancePlan(user.getInsurancePlan());
        }
        
        if (user.getPolicyNumber() != null) {
            existingUser.setPolicyNumber(user.getPolicyNumber());
        }
        
        return userRepository.save(existingUser);
    }

    /**
     * Update user profile data from a map of profile fields
     */
    public User updateUserProfile(User user, Map<String, String> profileData) {
        // Update the user profile fields from the map
        if (profileData.containsKey("email")) {
            user.setEmail(profileData.get("email"));
        }
        
        // Store profile data in user object directly
        // In a more complex application, this might be stored in a separate UserProfile entity
        if (profileData.containsKey("firstName")) {
            user.setFirstName(profileData.get("firstName"));
        }
        
        if (profileData.containsKey("lastName")) {
            user.setLastName(profileData.get("lastName"));
        }
        
        if (profileData.containsKey("phoneNumber")) {
            user.setPhoneNumber(profileData.get("phoneNumber"));
        }
        
        if (profileData.containsKey("address")) {
            user.setAddress(profileData.get("address"));
        }
        
        if (profileData.containsKey("dateOfBirth")) {
            user.setDateOfBirth(profileData.get("dateOfBirth"));
        }
        
        return userRepository.save(user);
    }

    /**
     * Find a user by username
     * @param username Username to search for
     * @return User if found, null otherwise
     */
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    
}