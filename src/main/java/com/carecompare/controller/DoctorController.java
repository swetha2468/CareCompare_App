package com.carecompare.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctors")
// The CrossOrigin annotation is not needed as we have global CORS configuration in WebMvcConfig
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true", allowedHeaders = {"Authorization", "Content-Type", "Accept", "X-Requested-With"}, methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class DoctorController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        
        List<Map<String, Object>> doctors = getMockDoctors();
        
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDoctorById(@PathVariable Long id) {
        // In a real application, this would query the database
        // For now, just return a mock for id 1-8
        if (id >= 1 && id <= 8) {
            Map<String, Object> doctor = new HashMap<>();
            
            String name;
            String specialization;
            
            switch (id.intValue()) {
                case 1:
                    name = "Dr. Sarah Johnson";
                    specialization = "General Physician";
                    break;
                case 2:
                    name = "Dr. Michael Chen";
                    specialization = "Dentist";
                    break;
                case 3:
                    name = "Dr. Emily Parker";
                    specialization = "Cardiologist";
                    break;
                case 4:
                    name = "Dr. James Smith";
                    specialization = "Cardiology";
                    break;
                case 5:
                    name = "Dr. Robert Williams";
                    specialization = "Neurology";
                    break;
                case 6:
                    name = "Dr. Lisa Brown";
                    specialization = "Orthopedics";
                    break;
                case 7:
                    name = "Dr. Michael Davis";
                    specialization = "Gastroenterology";
                    break;
                case 8:
                    name = "Dr. Emily Wilson";
                    specialization = "Ophthalmology";
                    break;
                default:
                    name = "Unknown Doctor";
                    specialization = "Unknown Specialization";
            }
            
            doctor.put("id", id);
            doctor.put("name", name);
            doctor.put("specialization", specialization);
            
            return ResponseEntity.ok(doctor);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Map<String, Object>>> getDoctorsBySpecialty(@PathVariable String specialty) {
        List<Map<String, Object>> allDoctors = getMockDoctors();
        
        List<Map<String, Object>> filteredDoctors = allDoctors.stream()
            .filter(doctor -> {
                String doctorSpecialty = (String) doctor.get("specialization");
                return doctorSpecialty.equalsIgnoreCase(specialty);
            })
            .collect(Collectors.toList());
        
        if (filteredDoctors.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(filteredDoctors);
    }
    
    private List<Map<String, Object>> getMockDoctors() {
        List<Map<String, Object>> doctors = new ArrayList<>();
        
        Map<String, Object> doctor1 = new HashMap<>();
        doctor1.put("id", 1);
        doctor1.put("name", "Dr. Sarah Johnson");
        doctor1.put("specialization", "General Physician");
        
        Map<String, Object> doctor2 = new HashMap<>();
        doctor2.put("id", 2);
        doctor2.put("name", "Dr. Michael Chen");
        doctor2.put("specialization", "Dentist");
        
        Map<String, Object> doctor3 = new HashMap<>();
        doctor3.put("id", 3);
        doctor3.put("name", "Dr. Emily Parker");
        doctor3.put("specialization", "Cardiologist");
        
        Map<String, Object> doctor4 = new HashMap<>();
        doctor4.put("id", 4);
        doctor4.put("name", "Dr. James Smith");
        doctor4.put("specialization", "Cardiology");
        
        Map<String, Object> doctor5 = new HashMap<>();
        doctor5.put("id", 5);
        doctor5.put("name", "Dr. Robert Williams");
        doctor5.put("specialization", "Neurology");
        
        Map<String, Object> doctor6 = new HashMap<>();
        doctor6.put("id", 6);
        doctor6.put("name", "Dr. Lisa Brown");
        doctor6.put("specialization", "Orthopedics");
        
        Map<String, Object> doctor7 = new HashMap<>();
        doctor7.put("id", 7);
        doctor7.put("name", "Dr. Michael Davis");
        doctor7.put("specialization", "Gastroenterology");
        
        Map<String, Object> doctor8 = new HashMap<>();
        doctor8.put("id", 8);
        doctor8.put("name", "Dr. Emily Wilson");
        doctor8.put("specialization", "Ophthalmology");
        
        doctors.add(doctor1);
        doctors.add(doctor2);
        doctors.add(doctor3);
        doctors.add(doctor4);
        doctors.add(doctor5);
        doctors.add(doctor6);
        doctors.add(doctor7);
        doctors.add(doctor8);
        
        return doctors;
    }
} 