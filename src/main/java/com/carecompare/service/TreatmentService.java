package com.carecompare.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.Treatment;
import com.carecompare.repository.TreatmentRepository;

@Service
public class TreatmentService {
    @Autowired
    private TreatmentRepository treatmentRepository;
    @Autowired
    private TreatmentExplainerService treatmentExplainerService;

    public Treatment findById(Long id) {
        Optional<Treatment> treatment = treatmentRepository.findById(id);
        return treatment.orElse(null);
    }

    public List<Treatment> findByHospitalId(Long hospitalId) {
        return treatmentRepository.findByHospitalId(hospitalId);
    }

    public Treatment save(Treatment treatment) {
        return treatmentRepository.save(treatment);
    }

    public void delete(Long id) {
        treatmentRepository.deleteById(id);
    }

    public String explainTreatment(String treatmentName) {
        return treatmentExplainerService.explainTreatment(treatmentName);
    }
}