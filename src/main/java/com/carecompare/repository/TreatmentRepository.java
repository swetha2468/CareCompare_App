package com.carecompare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.carecompare.model.Treatment;

/**
 * Repository interface for accessing treatment details linked to insurance plans.
 */
@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findByInsurancePlanPlanId(Long planId);
}
