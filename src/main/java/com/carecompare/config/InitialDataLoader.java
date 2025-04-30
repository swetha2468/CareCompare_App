package com.carecompare.config;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import com.carecompare.repository.InsurancePlanRepository;
import com.carecompare.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;

/**
 * This class initializes the database with seed data.
 * It runs only when the application starts.
 */
@Configuration
public class InitialDataLoader {
    private static final Logger logger = LoggerFactory.getLogger(InitialDataLoader.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InsurancePlanRepository insurancePlanRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    @Transactional
    public void initData() {
        logger.info("Starting data initialization check...");
        
        try {
            // Always reset sequences to prevent ID conflicts
            resetSequences();
            
            // Create insurance plans if none exist
            if (insurancePlanRepository.count() == 0) {
                logger.info("No insurance plans found, creating default plans");
                createDefaultInsurancePlans();
            } else {
                logger.info("Found {} existing insurance plans", insurancePlanRepository.count());
            }
            
            // Create a demo user if no users exist
            if (userRepository.count() == 0) {
                logger.info("No users found, creating demo user");
                createDemoUser();
            } else {
                logger.info("Found {} existing users", userRepository.count());
            }
            
            logger.info("Database initialization completed successfully");
        } catch (Exception e) {
            logger.error("Error initializing database: {}", e.getMessage(), e);
        }
    }
    
    private void resetSequences() throws SQLException {
        logger.info("Resetting database sequences...");
        
        try (Connection conn = dataSource.getConnection()) {
            try (Statement stmt = conn.createStatement()) {
                // Reset all sequences to higher values to prevent conflicts
                stmt.execute("SELECT setval('insurance_plan_id_seq', 1000, true)");
                stmt.execute("SELECT setval(pg_get_serial_sequence('\"user\"', 'id'), 1000, true)");
                stmt.execute("SELECT setval('user_profile_id_seq', 1000, true)");
                stmt.execute("SELECT setval('hospital_id_seq', 1000, true)");
                stmt.execute("SELECT setval('appointment_id_seq', 1000, true)");
                stmt.execute("SELECT setval('medical_record_id_seq', 1000, true)");
                stmt.execute("SELECT setval('treatment_id_seq', 1000, true)");
            }
        }
        
        logger.info("Successfully reset database sequences");
    }
    
    private void createDefaultInsurancePlans() {
        logger.info("Creating default insurance plans");
        
        try {
            // Create basic plans
            InsurancePlan plan1 = new InsurancePlan();
            plan1.setName("Basic Plan");
            plan1.setProvider("Blue Cross");
            plan1.setCoverage("Basic coverage - 70% coinsurance");
            plan1.setBenefits("Annual checkups, emergency care");
            plan1.setPolicyNumber("BC001");
            insurancePlanRepository.save(plan1);
            logger.info("Created insurance plan: {}", plan1.getName());
            
            InsurancePlan plan2 = new InsurancePlan();
            plan2.setName("Premium Plan");
            plan2.setProvider("Blue Cross");
            plan2.setCoverage("Premium coverage - 90% coinsurance");
            plan2.setBenefits("Full coverage including dental and vision");
            plan2.setPolicyNumber("BC002");
            insurancePlanRepository.save(plan2);
            logger.info("Created insurance plan: {}", plan2.getName());
            
            InsurancePlan plan3 = new InsurancePlan();
            plan3.setName("Standard Plan");
            plan3.setProvider("Aetna");
            plan3.setCoverage("Standard coverage - 80% coinsurance");
            plan3.setBenefits("Hospitalization, prescription drugs, specialist visits");
            plan3.setPolicyNumber("AET100");
            insurancePlanRepository.save(plan3);
            logger.info("Created insurance plan: {}", plan3.getName());
            
            InsurancePlan plan4 = new InsurancePlan();
            plan4.setName("Gold Plan");
            plan4.setProvider("UnitedHealth");
            plan4.setCoverage("Comprehensive coverage - 85% coinsurance");
            plan4.setBenefits("Low deductibles, mental health coverage");
            plan4.setPolicyNumber("UHC500");
            insurancePlanRepository.save(plan4);
            logger.info("Created insurance plan: {}", plan4.getName());
            
            InsurancePlan plan5 = new InsurancePlan();
            plan5.setName("Silver Plan");
            plan5.setProvider("Cigna");
            plan5.setCoverage("Mid-tier coverage - 75% coinsurance");
            plan5.setBenefits("Preventive care, maternity coverage");
            plan5.setPolicyNumber("CIG250");
            insurancePlanRepository.save(plan5);
            logger.info("Created insurance plan: {}", plan5.getName());
            
            logger.info("Successfully created default insurance plans");
        } catch (Exception e) {
            logger.error("Error creating default insurance plans: {}", e.getMessage(), e);
        }
    }
    
    private void createDemoUser() {
        logger.info("Creating demo user account");
        
        // Check if the demo user already exists
        Optional<User> existingUser = userRepository.findByUsername("demo");
        if (existingUser.isPresent()) {
            logger.info("Demo user already exists, skipping creation");
            return;
        }
        
        try {
            // Create a demo user
            User demoUser = new User();
            demoUser.setUsername("demo");
            demoUser.setEmail("demo@example.com");
            demoUser.setPassword(passwordEncoder.encode("password123"));
            
            // Assign an insurance plan if available
            Optional<InsurancePlan> plan = insurancePlanRepository.findByPolicyNumber("BC001");
            if (plan.isPresent()) {
                demoUser.setInsurancePlan(plan.get());
                demoUser.setPolicyNumber("BC001");
                logger.info("Assigned insurance plan to demo user: {}", plan.get().getName());
            } else {
                logger.warn("No insurance plan found to assign to demo user");
            }
            
            userRepository.save(demoUser);
            logger.info("Demo user created successfully with ID: {}", demoUser.getId());
        } catch (Exception e) {
            logger.error("Error creating demo user: {}", e.getMessage(), e);
        }
    }
} 