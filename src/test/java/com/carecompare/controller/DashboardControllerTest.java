package com.carecompare.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.carecompare.service.DashboardService;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardController dashboardController;

    @BeforeEach
    @SuppressWarnings("unused")
    
    void setUp() {
        MockitoAnnotations.openMocks(this);

        String mockToken = "Bearer valid_token";

        Map<String, Object> policy1 = new HashMap<>();
        policy1.put("insurancePlan", "Gold Health Plan");
        policy1.put("insuranceCompany", "Blue Shield"); 
        policy1.put("deductible", 500.0);
        policy1.put("coveredTreatments", List.of("Root Canal"));
        policy1.put("discounts", "Dental, Vision");

        List<Map<String, Object>> mockResponse = List.of(policy1);

        when(dashboardService.getUserPolicyDetails("valid_token")).thenReturn(mockResponse);
    }




    @Test
    void testGetUserPolicies_NoPoliciesFound() {
        String mockToken = "Bearer valid_token";
        
       
        lenient().when(dashboardService.getUserPolicyDetails("valid_token")).thenReturn(null);

        ResponseEntity<?> response = dashboardController.getUserPolicies(mockToken);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No policies found for this user.", response.getBody());
    }

}
