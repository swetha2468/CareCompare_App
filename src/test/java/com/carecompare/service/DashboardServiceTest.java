package com.carecompare.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;
import com.carecompare.util.JwtUtil;

public class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        MockitoAnnotations.openMocks(this); // Ensure mocks are initialized
        dashboardService = new DashboardService(userRepository, jwtUtil);
    }

    @Test
    void testGetUserPolicyDetails_ValidJWT() {
        String token = "validJwtToken";
        String email = "test@example.com";
        User mockUser = new User(1L, "Test User", email, "hashedpassword", Arrays.asList(new InsurancePlan()));

        when(jwtUtil.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        List<InsurancePlan> result = dashboardService.getUserPolicyDetails(token);
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetUserPolicyDetails_InvalidJWT() {
        String token = "invalidJwtToken";
        when(jwtUtil.extractEmail(token)).thenReturn(null);

        List<InsurancePlan> result = dashboardService.getUserPolicyDetails(token);
        assertNull(result);
    }

    @Test
    void testGetUserPolicyDetails_UserNotFound() {
        String token = "validJwtToken";
        String email = "test@example.com";
        when(jwtUtil.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        List<InsurancePlan> result = dashboardService.getUserPolicyDetails(token);
        assertNull(result);
    }
}