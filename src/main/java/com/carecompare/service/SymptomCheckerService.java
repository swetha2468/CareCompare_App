package com.carecompare.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

/**
 * Service for basic symptom checking and recommendation
 * This will be enhanced with LLM integration in future versions
 */
@Service
public class SymptomCheckerService {

    private final Map<String, List<String>> symptomsConditions = new HashMap<>();
    private final Map<String, String> conditionAdvice = new HashMap<>();

    public SymptomCheckerService() {
        // Initialize with basic symptom patterns and corresponding conditions
        symptomsConditions.put("headache", Arrays.asList("migraine", "tension headache", "sinus issue"));
        symptomsConditions.put("fever", Arrays.asList("common cold", "flu", "infection"));
        symptomsConditions.put("cough", Arrays.asList("common cold", "bronchitis", "allergies"));
        symptomsConditions.put("chest pain", Arrays.asList("cardiac issue", "heartburn", "muscle strain"));
        symptomsConditions.put("fatigue", Arrays.asList("anemia", "sleep disorder", "depression"));
        symptomsConditions.put("sore throat", Arrays.asList("strep throat", "common cold", "allergies"));
        symptomsConditions.put("dizziness", Arrays.asList("vertigo", "low blood pressure", "dehydration"));
        symptomsConditions.put("shortness of breath", Arrays.asList("anxiety", "asthma", "heart condition"));
        symptomsConditions.put("nausea", Arrays.asList("food poisoning", "migraine", "pregnancy"));
        
        // Initialize with basic condition advice
        conditionAdvice.put("common cold", "Rest, stay hydrated, and consider over-the-counter medications for symptom relief.");
        conditionAdvice.put("flu", "Rest, stay hydrated, and consult a doctor if symptoms are severe.");
        conditionAdvice.put("migraine", "Rest in a dark, quiet room and consider over-the-counter pain relievers.");
        conditionAdvice.put("allergies", "Avoid allergens if known and consider antihistamines.");
        conditionAdvice.put("infection", "Consult a doctor as antibiotics may be needed.");
        conditionAdvice.put("dehydration", "Increase fluid intake and rest. Seek medical help if severe.");
    }

    /**
     * Check symptoms and provide possible conditions and advice
     * @param symptoms The symptoms described by the user
     * @return A response containing possible conditions and advice
     */
    public Map<String, Object> checkSymptoms(String symptoms) {
        if (symptoms == null || symptoms.trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Please describe your symptoms");
            return response;
        }
        
        String normalizedSymptoms = symptoms.toLowerCase().trim();
        List<String> possibleConditions = new ArrayList<>();
        
        // Check for each known symptom in the description
        for (Map.Entry<String, List<String>> entry : symptomsConditions.entrySet()) {
            if (Pattern.compile("\\b" + entry.getKey() + "\\b").matcher(normalizedSymptoms).find()) {
                possibleConditions.addAll(entry.getValue());
            }
        }
        
        
        List<String> uniqueConditions = new ArrayList<>(new java.util.LinkedHashSet<>(possibleConditions));
        
        // Generate advice
        StringBuilder adviceBuilder = new StringBuilder();
        if (uniqueConditions.isEmpty()) {
            adviceBuilder.append("Based on the information provided, I couldn't identify specific conditions. ");
            adviceBuilder.append("Please consult a healthcare professional for proper diagnosis.");
        } else {
            adviceBuilder.append("Based on your symptoms, you might be experiencing: ");
            adviceBuilder.append(String.join(", ", uniqueConditions));
            adviceBuilder.append(". ");
            
            // Add specific advice for the first identified condition
            if (!uniqueConditions.isEmpty() && conditionAdvice.containsKey(uniqueConditions.get(0))) {
                adviceBuilder.append(conditionAdvice.get(uniqueConditions.get(0)));
            } else {
                adviceBuilder.append("Consider consulting a healthcare professional for proper diagnosis and treatment.");
            }
        }
        
        
        adviceBuilder.append(" Note: This is not a substitute for professional medical advice.");
        
        Map<String, Object> response = new HashMap<>();
        response.put("symptoms", normalizedSymptoms);
        response.put("possibleConditions", uniqueConditions);
        response.put("advice", adviceBuilder.toString());
        response.put("disclaimer", "Powered by CareCompare - Not a replacement for medical advice.");
        
        return response;
    }
} 