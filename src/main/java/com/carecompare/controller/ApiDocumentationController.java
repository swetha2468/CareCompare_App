package com.carecompare.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to provide documentation for all API endpoints
 */
@RestController
@RequestMapping("/api/docs")
public class ApiDocumentationController {

    /**
     * Get documentation for all API endpoints
     * @return Map containing API endpoint documentation
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getApiDocumentation() {
        Map<String, Object> documentation = new HashMap<>();
        documentation.put("name", "CareCompare API");
        documentation.put("version", "1.0.0");
        documentation.put("description", "API for healthcare comparison and management");
        
        List<Map<String, Object>> endpoints = new ArrayList<>();
        
        // Authentication endpoints
        endpoints.add(createEndpointDoc(
            "Authentication", 
            "/api/auth/login", 
            "POST", 
            "Login with username and password", 
            "No authentication required",
            Map.of("username", "string", "password", "string"),
            Map.of("token", "string")
        ));
        
        endpoints.add(createEndpointDoc(
            "Authentication", 
            "/api/auth/register", 
            "POST", 
            "Register a new user", 
            "No authentication required",
            Map.of("username", "string", "password", "string", "email", "string"),
            Map.of("message", "string", "user", "object")
        ));
        
        // User Profile endpoints
        endpoints.add(createEndpointDoc(
            "User Profiles", 
            "/api/profile/{id}", 
            "GET", 
            "Get user profile by ID", 
            "JWT authentication required",
            null,
            Map.of("id", "number", "firstName", "string", "lastName", "string", "phone", "string")
        ));
        
        // Insurance Plan endpoints
        endpoints.add(createEndpointDoc(
            "Insurance Plans", 
            "/api/insurance", 
            "GET", 
            "Get all insurance plans", 
            "JWT authentication required",
            null,
            "Array of insurance plan objects"
        ));
        
        // Hospital endpoints
        endpoints.add(createEndpointDoc(
            "Hospitals", 
            "/api/hospital/by-policy/{policyNumber}", 
            "GET", 
            "Get hospitals by policy number", 
            "JWT authentication required",
            null,
            "Array of hospital objects"
        ));
        
        // Appointment endpoints
        endpoints.add(createEndpointDoc(
            "Appointments", 
            "/api/appointments", 
            "POST", 
            "Book a new appointment", 
            "JWT authentication required",
            Map.of("hospital", "object", "doctor", "string", "time", "string"),
            "Appointment object"
        ));
        
        // Treatment endpoints
        endpoints.add(createEndpointDoc(
            "Treatments", 
            "/api/treatment/explain/{treatmentName}", 
            "GET", 
            "Get explanation for a treatment", 
            "JWT authentication required",
            null,
            Map.of("treatment", "string", "explanation", "string")
        ));
        
        // Symptom Checker endpoints
        endpoints.add(createEndpointDoc(
            "Symptom Checker", 
            "/api/symptom-checker", 
            "POST", 
            "Check symptoms and get possible conditions", 
            "No authentication required",
            Map.of("symptoms", "string"),
            Map.of("symptoms", "string", "possibleConditions", "array", "advice", "string")
        ));
        
        // Dashboard endpoints
        endpoints.add(createEndpointDoc(
            "Dashboard", 
            "/api/dashboard/plans/{userId}", 
            "GET", 
            "Get insurance plans for user", 
            "JWT authentication required",
            null,
            "Array of insurance plan objects"
        ));
        
        documentation.put("endpoints", endpoints);
        
        return ResponseEntity.ok(documentation);
    }
    
    /**
     * Helper method to create endpoint documentation
     */
    private Map<String, Object> createEndpointDoc(
            String category, 
            String path, 
            String method, 
            String description, 
            String auth,
            Object requestBody,
            Object responseBody) {
        
        Map<String, Object> endpoint = new HashMap<>();
        endpoint.put("category", category);
        endpoint.put("path", path);
        endpoint.put("method", method);
        endpoint.put("description", description);
        endpoint.put("authentication", auth);
        
        if (requestBody != null) {
            endpoint.put("requestBody", requestBody);
        }
        
        endpoint.put("responseBody", responseBody);
        
        return endpoint;
    }
} 