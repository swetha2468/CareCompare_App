package com.carecompare.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.InsurancePlan;
import com.carecompare.repository.InsurancePlanRepository;

@Service
public class InsurancePlanService {
    private static final Logger logger = LoggerFactory.getLogger(InsurancePlanService.class);
    
    @Autowired
    private InsurancePlanRepository insurancePlanRepository;

    public Optional<InsurancePlan> findById(Long id) {
        return insurancePlanRepository.findById(id);
    }

    public List<InsurancePlan> findAll() {
        List<InsurancePlan> plans = insurancePlanRepository.findAll();
        
        // If no plans exist, create default ones
        if (plans == null || plans.isEmpty()) {
            logger.warn("No insurance plans found in database, creating default plans");
            plans = createDefaultPlans();
        }
        
        logger.info("Returning {} insurance plans", plans.size());
        return plans;
    }

    public InsurancePlan save(InsurancePlan insurancePlan) {
        return insurancePlanRepository.save(insurancePlan);
    }

    public void delete(Long id) {
        insurancePlanRepository.deleteById(id);
    }

    public Optional<InsurancePlan> findByPolicyNumber(String policyNumber) {
        return insurancePlanRepository.findByPolicyNumber(policyNumber);
    }
    
    /**
     * Creates default insurance plans if none exist in the database
     * @return List of created insurance plans
     */
    private List<InsurancePlan> createDefaultPlans() {
        logger.info("Creating default insurance plans");
        List<InsurancePlan> defaultPlans = new ArrayList<>();
        
        try {
            // Create basic plans
            InsurancePlan plan1 = new InsurancePlan();
            plan1.setName("Basic Plan");
            plan1.setProvider("Blue Cross");
            plan1.setCoverage("Basic coverage - 70% coinsurance");
            plan1.setBenefits("Annual checkups, emergency care");
            plan1.setPolicyNumber("BC001");
            defaultPlans.add(insurancePlanRepository.save(plan1));
            
            InsurancePlan plan2 = new InsurancePlan();
            plan2.setName("Premium Plan");
            plan2.setProvider("Blue Cross");
            plan2.setCoverage("Premium coverage - 90% coinsurance");
            plan2.setBenefits("Full coverage including dental and vision");
            plan2.setPolicyNumber("BC002");
            defaultPlans.add(insurancePlanRepository.save(plan2));
            
            InsurancePlan plan3 = new InsurancePlan();
            plan3.setName("Standard Plan");
            plan3.setProvider("Aetna");
            plan3.setCoverage("Standard coverage - 80% coinsurance");
            plan3.setBenefits("Hospitalization, prescription drugs, specialist visits");
            plan3.setPolicyNumber("AET100");
            defaultPlans.add(insurancePlanRepository.save(plan3));
            
            logger.info("Successfully created {} default insurance plans", defaultPlans.size());
        } catch (Exception e) {
            logger.error("Error creating default insurance plans: {}", e.getMessage(), e);
        }
        
        return defaultPlans;
    }
    
    /**
     * Generates a unique policy number for a given insurance plan
     * @param planId The ID of the insurance plan
     * @return A unique policy number string
     */
    public String generatePolicyNumber(Long planId) {
        Optional<InsurancePlan> planOpt = findById(planId);
        if (planOpt.isEmpty()) {
            return null;
        }
        
        InsurancePlan plan = planOpt.get();
        
        // Extract first letters of provider name
        String prefix = "";
        if (plan.getProvider() != null && !plan.getProvider().isEmpty()) {
            String[] words = plan.getProvider().split("\\s+");
            for (String word : words) {
                if (!word.isEmpty()) {
                    prefix += word.toUpperCase().charAt(0);
                }
            }
        }
        
        // If no prefix could be generated, use a default
        if (prefix.isEmpty()) {
            prefix = "INS";
        }
        
        // Add plan ID and random number
        Random random = new Random();
        int randomNum = 100000 + random.nextInt(900000); // 6-digit number
        
        return prefix + planId + "-" + randomNum;
    }
}