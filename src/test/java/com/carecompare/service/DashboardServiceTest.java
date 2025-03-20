package com.carecompare.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.transaction.annotation.Transactional;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.Treatment;
import com.carecompare.model.User;
import com.carecompare.repository.InsurancePlanRepository;
import com.carecompare.repository.TreatmentRepository;
import com.carecompare.repository.UserRepository;
import com.carecompare.util.JwtUtil;



@Transactional
public class DashboardServiceTest {


    @Mock
    private InsurancePlanRepository insurancePlanRepository;



    @Mock
    private UserRepository userRepository;

    @Mock
    private TreatmentRepository treatmentRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private DashboardService dashboardService;

    private User mockUser;
    private InsurancePlan mockPlan;
    private Treatment mockTreatment;


    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Create a test user
        mockUser = new User();
        mockUser.setUserId(1L);
        mockUser.setName("Test User");
        mockUser.setEmail("test@example.com");

        //  Create a test insurance plan
        mockPlan = new InsurancePlan();
        mockPlan.setPlanId(1L);
        mockPlan.setInsuranceName("Blue Shield"); //  Ensure this matches the test assertion
        mockPlan.setPlanName("Premium Health Plan");
        mockPlan.setDeductible(500.0);
        mockPlan.setCoveredTreatments("Dental, Vision");
        mockPlan.setUser(mockUser);

        //  Ensure the mock user has an insurance plan
        mockUser.setInsurancePlans(List.of(mockPlan));

        // Mock JWT Token extraction
        when(jwtUtil.extractEmail("validJwtToken")).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        
        when(insurancePlanRepository.findByUserUserId(1L)).thenReturn(List.of(mockPlan));
    }




    @Test
    void testGetUserPolicyDetails_ValidJWT() {
        String token = "validJwtToken";
        when(treatmentRepository.findByInsurancePlanPlanId(mockPlan.getPlanId()))
            .thenReturn(List.of(mockTreatment));

        List<Map<String, Object>> result = dashboardService.getUserPolicyDetails(token);
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());

        Map<String, Object> policy = result.get(0);
        assertEquals("Premium Health Plan", policy.get("insurancePlan"));
        assertEquals("Blue Shield", policy.get("insuranceCompany"));
        assertEquals(500.0, policy.get("deductible"));
        assertEquals(List.of(mockTreatment), policy.get("coveredTreatments"));
        assertEquals("Dental, Vision", policy.get("discounts"));
    }

    @Test
    void testGetUserPolicyDetails_InvalidJWT() {
        String token = "invalidJwtToken";
        when(jwtUtil.extractEmail(token)).thenReturn(null);

        List<Map<String, Object>> result = dashboardService.getUserPolicyDetails(token);
        assertTrue(result.isEmpty(), "Expected an empty list but found policies.");

    }

    @Test
    void testGetUserPolicyDetails_UserNotFound() {
        String token = "validJwtToken";
        String email = "unknown@example.com";
        when(jwtUtil.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        List<Map<String, Object>> result = dashboardService.getUserPolicyDetails(token);
        assertTrue(result.isEmpty(), "Expected an empty list but found something else.");

    }

    @Test
    void testGetUserPolicyDetails_NoPoliciesFound() {
        String token = "validJwtToken";
        String email = "test@example.com";

        mockUser.setInsurancePlans(new ArrayList<>()); 

        when(jwtUtil.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        List<Map<String, Object>> result = dashboardService.getUserPolicyDetails(token);
        assertTrue(result.isEmpty(), "Expected an empty list but found policies.");

    }

    @AfterEach
    @SuppressWarnings("unused")
    void tearDown() {
        reset(insurancePlanRepository, userRepository, treatmentRepository, jwtUtil);
    }
}
