package com.carecompare.service;

import org.springframework.stereotype.Service;
import com.carecompare.model.User;
import com.carecompare.model.InsurancePlan;
import com.carecompare.repository.UserRepository;
import com.carecompare.util.JwtUtil;

import java.util.Optional;
import java.util.List;

/**
 * Service class responsible for fetching user policy details.
 * It extracts the user’s email from the JWT token and retrieves their insurance plans.
 */
@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * Constructor-based dependency injection.
     * 
     * @param userRepository Repository for fetching user details.
     * @param jwtUtil Utility for extracting user details from JWT token.
     */
    public DashboardService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Fetches the authenticated user's insurance policies.
     * 
     * Steps:
     * 1. Extract the user's email from the JWT token.
     * 2. Retrieve the user from the database using the email.
     * 3. Fetch the insurance plans linked to this user.
     * 4. Return the policy details.
     * 
     * @param token JWT token received in the request header.
     * @return List of Insurance Plans if found, otherwise null.
     */
    public List<InsurancePlan> getUserPolicyDetails(String token) {
        // Extract user email from JWT token
        String userEmail = jwtUtil.extractEmail(token);

        // Fetch user details based on email
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return user.getInsurancePlans(); // Get linked insurance plans
        } else {
            return null; // User not found
        }
    }
}
