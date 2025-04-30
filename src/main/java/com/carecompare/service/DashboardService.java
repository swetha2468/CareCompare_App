package com.carecompare.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.repository.InsurancePlanRepository;
import com.carecompare.repository.UserRepository;

@Service
public class DashboardService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private InsurancePlanRepository insurancePlanRepository;

    public List<InsurancePlan> getUserPlans(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return insurancePlanRepository.findAll(); // Placeholder
    }

    public List<Map<String, Object>> comparePlans(Long userId, List<Long> planIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        List<InsurancePlan> userPlans = getUserPlans(userId);
        List<InsurancePlan> comparePlans = insurancePlanRepository.findAllById(planIds);

        return comparePlans.stream().map(plan -> {
            InsurancePlan userPlan = userPlans.get(0); // Simplify: Use first user plan
            Map<String, Object> result = new HashMap<>();
            result.put("id", plan.getId());
            result.put("name", plan.getName());
            result.put("coverage", plan.getCoverage());
            result.put("benefitsDiff", compareBenefits(userPlan.getBenefits(), plan.getBenefits()));
            result.put("coverageDiff", compareCoverage(userPlan.getCoverage(), plan.getCoverage()));
            return result;
        }).collect(Collectors.toList());
    }

    private String compareBenefits(String userBenefits, String otherBenefits) {
        return userBenefits != null && userBenefits.equals(otherBenefits) ? "Same" : "Different (" + (otherBenefits != null ? otherBenefits : "N/A") + ")";
    }

    private String compareCoverage(String userCoverage, String otherCoverage) {
        return userCoverage != null && userCoverage.equals(otherCoverage) ? "Same" : "Different (" + (otherCoverage != null ? otherCoverage : "N/A") + ")";
    }
}