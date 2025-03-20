package com.carecompare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.carecompare.model.InsurancePlan;

@Repository
public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {

    //  Add this method to fetch plans by User ID
    List<InsurancePlan> findByUserUserId(Long userId);
}
