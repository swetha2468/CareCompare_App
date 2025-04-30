package com.carecompare.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

/**
 * Service for explaining medical treatments in simple terms
 * This will be enhanced with LLM integration in future versions
 */
@Service
public class TreatmentExplainerService {

    private final Map<String, String> explanations = new HashMap<>();

    public TreatmentExplainerService() {
        // Pre-populate with some common treatments
        explanations.put("dialysis", "A medical procedure that filters waste from the blood when kidneys can't do their job properly.");
        explanations.put("chemotherapy", "A treatment that uses drugs to kill cancer cells in the body.");
        explanations.put("angioplasty", "A procedure to open narrowed or blocked blood vessels that supply blood to the heart.");
        explanations.put("appendectomy", "Surgery to remove the appendix, usually performed as emergency surgery.");
        explanations.put("cataract surgery", "A procedure to remove the cloudy lens of the eye and replace it with an artificial lens.");
        explanations.put("colonoscopy", "An exam used to detect changes or abnormalities in the large intestine and rectum.");
        explanations.put("hysterectomy", "Surgery to remove the uterus, sometimes including other reproductive organs.");
        explanations.put("bypass surgery", "A procedure that redirects blood flow around a blocked section of an artery.");
    }

    /**
     * Explains a treatment in simple terms
     * @param treatmentName The name of the treatment
     * @return A simple explanation of the treatment
     */
    public String explainTreatment(String treatmentName) {
        if (treatmentName == null || treatmentName.isEmpty()) {
            return "Please provide a valid treatment name.";
        }
        
        String key = treatmentName.toLowerCase().trim();
        return explanations.getOrDefault(key, 
                "No simple explanation available for this treatment yet. Please consult with a healthcare professional.");
    }
}