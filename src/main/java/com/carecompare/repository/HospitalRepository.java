package com.carecompare.repository;

import java.util.List; 

import org.springframework.data.jpa.repository.JpaRepository;

import com.carecompare.model.Hospital;
import com.carecompare.model.InsurancePlan;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByAcceptedPlansContaining(InsurancePlan plan); 
    List<Hospital> findByStateContainingIgnoreCase(String state);
}