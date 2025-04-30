package com.carecompare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.MedicalRecord;
import com.carecompare.repository.MedicalRecordRepository;

@Service
public class MedicalRecordService {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    public List<MedicalRecord> getRecordsByUserId(Long userId) {
        return medicalRecordRepository.findByPatientId(userId);
    }
}