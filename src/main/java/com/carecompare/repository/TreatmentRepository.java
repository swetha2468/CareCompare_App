package com.carecompare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carecompare.model.Treatment;

public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findByHospitalId(Long hospitalId); 
}