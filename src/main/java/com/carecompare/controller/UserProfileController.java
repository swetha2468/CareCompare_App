package com.carecompare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carecompare.model.UserProfile;
import com.carecompare.service.UserProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UserProfile userProfile) {
        if (userProfile.getUser() == null || userProfile.getFirstName() == null
                || userProfile.getLastName() == null || userProfile.getPhoneNumber() == null) {
            return ResponseEntity.badRequest().body("Invalid request: missing fields.");
        }

        UserProfile updatedProfile = userProfileService.createOrUpdateProfile(userProfile);

        if (updatedProfile != null) {
            return ResponseEntity.ok(updatedProfile);
        } else {
            return ResponseEntity.badRequest().body("Failed to update user profile.");
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        UserProfile userProfile = userProfileService.getUserProfile(userId);

        if (userProfile != null) {
            return ResponseEntity.ok(userProfile);
        } else {
            return ResponseEntity.status(404).body("User profile not found.");
        }
    }
}
