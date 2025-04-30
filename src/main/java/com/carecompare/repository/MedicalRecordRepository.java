package com.carecompare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carecompare.model.MedicalRecord;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientId(Long patientId);
}