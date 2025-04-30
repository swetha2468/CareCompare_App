package com.carecompare.controller;

import com.carecompare.model.Hospital;
import com.carecompare.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/hospitals")
// The CrossOrigin annotation is not needed as we have global CORS configuration in WebMvcConfig
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class HospitalController {

    @Autowired
    private HospitalService hospitalService;

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        List<Hospital> hospitals = hospitalService.findAll();
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable Long id) {
        Optional<Hospital> hospital = hospitalService.findById(id);
        return hospital.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/state/{state}")
    public ResponseEntity<List<Hospital>> getHospitalsByState(@PathVariable String state) {
        List<Hospital> hospitals = hospitalService.findByState(state);
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Hospital>> searchHospitals(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String zipCode) {
        List<Hospital> hospitals = hospitalService.search(name, city, state, zipCode);
        return ResponseEntity.ok(hospitals);
    }

    @PostMapping
    public ResponseEntity<Hospital> createHospital(@RequestBody Hospital hospital) {
        Hospital savedHospital = hospitalService.save(hospital);
        return ResponseEntity.ok(savedHospital);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hospital> updateHospital(@PathVariable Long id, @RequestBody Hospital hospital) {
        hospital.setId(id);
        Hospital updatedHospital = hospitalService.save(hospital);
        return ResponseEntity.ok(updatedHospital);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hospitalService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-policy/{policyNumber}")
    public ResponseEntity<List<Hospital>> getHospitalsByPolicyNumber(@PathVariable String policyNumber) {
        List<Hospital> hospitals = hospitalService.findHospitalsByPolicyNumber(policyNumber);
        return ResponseEntity.ok(hospitals);
    }
}