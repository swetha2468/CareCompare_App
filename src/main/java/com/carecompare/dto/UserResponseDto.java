package com.carecompare.dto;

import com.carecompare.model.InsurancePlan;
import com.carecompare.model.User;
import lombok.Data;

@Data
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String policyNumber;
    private InsurancePlanDto insurancePlan;
    
    public UserResponseDto() {}
    
    public UserResponseDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.policyNumber = user.getPolicyNumber();
        
        if (user.getInsurancePlan() != null) {
            this.insurancePlan = new InsurancePlanDto(user.getInsurancePlan());
        }
    }
    
    @Data
    public static class InsurancePlanDto {
        private Long id;
        private String name;
        private String provider;
        private String benefits;
        private String coverage;
        
        public InsurancePlanDto(InsurancePlan plan) {
            this.id = plan.getId();
            this.name = plan.getName();
            this.provider = plan.getProvider();
            this.benefits = plan.getBenefits();
            this.coverage = plan.getCoverage();
        }
    }
} 