package com.carecompare.controller;

import com.carecompare.service.SymptomCheckerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for the symptom checker functionality
 */
@RestController
@RequestMapping("/api/symptom-checker")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class SymptomCheckerController {

    @Autowired
    private SymptomCheckerService symptomCheckerService;

    /**
     * Check symptoms and provide advice
     * @param requestBody Map containing the symptoms
     * @return Map with possible conditions and advice
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> checkSymptoms(@RequestBody Map<String, String> requestBody) {
        String symptoms = requestBody.get("symptoms");
        if (symptoms == null || symptoms.isEmpty()) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "error", "Please provide symptoms to check", 
                    "example", Map.of("symptoms", "I have a headache and fever")
                )
            );
        }
        
        Map<String, Object> response = symptomCheckerService.checkSymptoms(symptoms);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Simple health check for the symptom checker API
     * @return Status message
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        return ResponseEntity.ok(Map.of("status", "Symptom checker is working"));
    }
} 