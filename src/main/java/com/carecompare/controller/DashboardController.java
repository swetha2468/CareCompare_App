package com.carecompare.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.model.InsurancePlan;
import com.carecompare.service.DashboardService;

/**
 * Controller for handling dashboard-related requests.
 * Retrieves user insurance policy details.
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Constructor-based dependency injection for DashboardService.
     * 
     * @param dashboardService Service to fetch user policy details.
     */
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Endpoint to fetch authenticated user's insurance policies.
     * 
     * @param token JWT token provided in the request header.
     * @return List of insurance plans linked to the authenticated user.
     */
    @GetMapping("/policies")
    public ResponseEntity<?> getUserPolicies(@RequestHeader("Authorization") String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        List<InsurancePlan> policies = dashboardService.getUserPolicyDetails(token);

        if (policies != null && !policies.isEmpty()) {
            return ResponseEntity.ok(policies);
        } else {
            return ResponseEntity.status(404).body("No policies found for this user.");
        }
    }
}
