package com.carecompare.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.Treatment;
import com.carecompare.model.User;
import com.carecompare.repository.InsurancePlanRepository;
import com.carecompare.repository.TreatmentRepository;
import com.carecompare.repository.UserRepository;
import com.carecompare.util.JwtUtil;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final InsurancePlanRepository insurancePlanRepository;
    private final TreatmentRepository treatmentRepository;
    private final JwtUtil jwtUtil;

    public DashboardService(UserRepository userRepository, 
                        TreatmentRepository treatmentRepository, 
                        JwtUtil jwtUtil, 
                        InsurancePlanRepository insurancePlanRepository) {
    this.userRepository = userRepository;
    this.treatmentRepository = treatmentRepository;
    this.jwtUtil = jwtUtil;
    this.insurancePlanRepository = insurancePlanRepository;
}

    /**
     * Fetches user’s insurance policies along with covered treatments and discounts.
     */
    public List<Map<String, Object>> getUserPolicyDetails(String token) {
        if (token == null || token.isEmpty()) {
            return Collections.emptyList();
        }

        String email = jwtUtil.extractEmail(token);
        if (email == null) {
            return Collections.emptyList();
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }

        User user = userOpt.get();
        List<InsurancePlan> plans = insurancePlanRepository.findByUserUserId(user.getUserId());

        // ✅ Prevent NullPointerException
        if (plans == null || plans.isEmpty()) {
            return Collections.emptyList();
        }

        return plans.stream().map(plan -> {
            Map<String, Object> policyData = new HashMap<>();
            policyData.put("insurancePlan", plan.getPlanName());
            policyData.put("insuranceCompany", plan.getInsuranceName());
            policyData.put("deductible", plan.getDeductible());

            // Fetch covered treatments
            List<Treatment> coveredTreatments = treatmentRepository.findByInsurancePlanPlanId(plan.getPlanId());
            policyData.put("coveredTreatments", coveredTreatments != null ? coveredTreatments : Collections.emptyList());

            // Discounts
            policyData.put("discounts", plan.getCoveredTreatments());

            return policyData;
        }).collect(Collectors.toList());
    }
}
