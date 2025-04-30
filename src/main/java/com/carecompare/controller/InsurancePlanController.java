package com.carecompare.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.model.InsurancePlan;
import com.carecompare.service.InsurancePlanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/insurance")
// The CrossOrigin annotation is not needed as we have global CORS configuration in WebMvcConfig
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class InsurancePlanController {
    private static final Logger logger = LoggerFactory.getLogger(InsurancePlanController.class);
    
    @Autowired
    private InsurancePlanService insurancePlanService;

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InsurancePlan> getInsurancePlan(@PathVariable Long id) {
        logger.info("Fetching insurance plan with ID: {}", id);
        Optional<InsurancePlan> insurancePlanOptional = insurancePlanService.findById(id);
        return insurancePlanOptional.map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("No insurance plan found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping(value = "/policy/{policyNumber}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InsurancePlan> getInsurancePlanByPolicyNumber(@PathVariable String policyNumber) {
        logger.info("Fetching insurance plan with policy number: {}", policyNumber);
        Optional<InsurancePlan> plan = insurancePlanService.findByPolicyNumber(policyNumber);
        return plan.map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("No insurance plan found with policy number: {}", policyNumber);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<InsurancePlan>> getAllInsurancePlans() {
        logger.info("Fetching all insurance plans");
        try {
            List<InsurancePlan> plans = insurancePlanService.findAll();
            
            
            if (plans == null) {
                logger.error("Service returned null instead of empty list");
                plans = new ArrayList<>();
            }
            
            logger.info("Found {} insurance plans", plans.size());
            if (plans.isEmpty()) {
                logger.warn("No insurance plans found in the database");
            } else {
                
                for (InsurancePlan plan : plans) {
                    logger.info("Plan details - ID: {}, Name: {}, Provider: {}, Policy: {}", 
                        plan.getId(), plan.getName(), plan.getProvider(), plan.getPolicyNumber());
                }
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(plans);
        } catch (Exception e) {
            logger.error("Error fetching insurance plans", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/debug", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getDebugInsurancePlans() {
        logger.info("Fetching insurance plans for diagnostic purposes");
        try {
            List<InsurancePlan> plans = insurancePlanService.findAll();
            
            if (plans == null || plans.isEmpty()) {
                logger.warn("No insurance plans found in the database, creating sample plans for testing");
                
                
                List<InsurancePlan> samplePlans = new ArrayList<>();
                
                InsurancePlan samplePlan1 = new InsurancePlan();
                samplePlan1.setId(1L);
                samplePlan1.setName("Sample Basic Plan");
                samplePlan1.setProvider("Sample Provider");
                samplePlan1.setBenefits("Annual checkups, emergency care");
                samplePlan1.setCoverage("Basic coverage - 70% coinsurance");
                samplePlan1.setPolicyNumber("SAMPLE001");
                samplePlans.add(samplePlan1);
                
                InsurancePlan samplePlan2 = new InsurancePlan();
                samplePlan2.setId(2L);
                samplePlan2.setName("Sample Premium Plan");
                samplePlan2.setProvider("Sample Provider");
                samplePlan2.setBenefits("Comprehensive coverage including dental and vision");
                samplePlan2.setCoverage("Premium coverage - 90% coinsurance");
                samplePlan2.setPolicyNumber("SAMPLE002");
                samplePlans.add(samplePlan2);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(samplePlans);
            }
            
            logger.info("Found {} insurance plans", plans.size());
            // Log the plans to help diagnose serialization issues
            for (InsurancePlan plan : plans) {
                logger.info("Plan: id={}, name={}, provider={}, policyNumber={}", 
                    plan.getId(), plan.getName(), plan.getProvider(), plan.getPolicyNumber());
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(plans);
        } catch (Exception e) {
            logger.error("Error in debug endpoint", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InsurancePlan> createInsurancePlan(@Valid @RequestBody InsurancePlan insurancePlan) {
        logger.info("Creating new insurance plan: {}", insurancePlan.getName());
        InsurancePlan savedPlan = insurancePlanService.save(insurancePlan);
        logger.info("Successfully created plan with ID: {}", savedPlan.getId());
        return ResponseEntity.ok(savedPlan);
    }

    @PutMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InsurancePlan> updateInsurancePlan(@PathVariable Long id, @Valid @RequestBody InsurancePlan insurancePlan) {
        logger.info("Updating insurance plan with ID: {}", id);
        insurancePlan.setId(id);
        InsurancePlan updatedPlan = insurancePlanService.save(insurancePlan);
        logger.info("Successfully updated plan: {}", updatedPlan.getName());
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurancePlan(@PathVariable Long id) {
        logger.info("Deleting insurance plan with ID: {}", id);
        insurancePlanService.delete(id);
        logger.info("Successfully deleted plan with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}