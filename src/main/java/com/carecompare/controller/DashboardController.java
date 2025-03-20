package com.carecompare.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.service.DashboardService;

/**
 * Controller for handling dashboard-related requests.
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);
    
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Fetches authenticated user's insurance policies along with covered treatments.
     * 
     * @param token JWT token provided in the request header.
     * @return List of insurance plans with treatments & discounts.
     */
    @GetMapping("/policies")
    public ResponseEntity<?> getUserPolicies(@RequestHeader("Authorization") String token) {
        logger.info("🔹 Received request with Authorization header: {}", token);

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        logger.info("🔹 Extracted JWT token: {}", token);

        List<Map<String, Object>> policies = dashboardService.getUserPolicyDetails(token);

        if (policies != null && !policies.isEmpty()) {
            logger.info("Found {} policies for user.", policies.size());
            return ResponseEntity.ok(policies);
        } else {
            logger.warn(" No policies found for the user.");
            return ResponseEntity.status(404).body("No policies found for this user.");
        }
    }
}
