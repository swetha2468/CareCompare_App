package com.carecompare.controller;

import com.carecompare.model.MedicalRecord;
import com.carecompare.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    @Autowired
    private MedicalRecordService medicalRecordService;

    @GetMapping("/{userId}")
    public List<MedicalRecord> getMedicalRecords(@PathVariable Long userId) {
        return medicalRecordService.getRecordsByUserId(userId);
    }
}