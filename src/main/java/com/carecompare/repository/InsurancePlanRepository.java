package com.carecompare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carecompare.model.InsurancePlan;

public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {
    Optional<InsurancePlan> findByPolicyNumber(String policyNumber); 
}