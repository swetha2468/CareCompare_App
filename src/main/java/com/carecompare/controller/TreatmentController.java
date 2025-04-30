package com.carecompare.controller;

import com.carecompare.model.Treatment;
import com.carecompare.service.TreatmentExplainerService;
import com.carecompare.service.TreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/treatment")
public class TreatmentController {
    @Autowired
    private TreatmentService treatmentService;
    @Autowired
    private TreatmentExplainerService treatmentExplainerService;

    @GetMapping("/{id}")
    public ResponseEntity<Treatment> getTreatment(@PathVariable Long id) {
        Treatment treatment = treatmentService.findById(id);
        return treatment != null ? ResponseEntity.ok(treatment) : ResponseEntity.notFound().build();
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<Treatment>> getTreatmentsByHospital(@PathVariable Long hospitalId) {
        List<Treatment> treatments = treatmentService.findByHospitalId(hospitalId);
        return ResponseEntity.ok(treatments);
    }

    @PostMapping
    public ResponseEntity<Treatment> createTreatment(@RequestBody Treatment treatment) {
        try {
            Treatment savedTreatment = treatmentService.save(treatment);
            return ResponseEntity.ok(savedTreatment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTreatment(@PathVariable Long id) {
        treatmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/explain/{treatmentName}")
    public ResponseEntity<Map<String, String>> explainTreatment(@PathVariable String treatmentName) {
        String explanation = treatmentExplainerService.explainTreatment(treatmentName);
        Map<String, String> response = new HashMap<>();
        response.put("treatment", treatmentName);
        response.put("explanation", explanation);
        return ResponseEntity.ok(response);
    }
}