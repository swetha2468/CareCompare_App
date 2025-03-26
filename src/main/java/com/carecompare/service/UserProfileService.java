package com.carecompare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.UserProfile;
import com.carecompare.repository.UserProfileRepository;
import com.carecompare.repository.UserRepository;

/**
 * Service class for managing user profiles.
 */
@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    public UserProfile createOrUpdateProfile(UserProfile userProfile) {
        if (userProfile.getUser() == null || userProfile.getUser().getUserId() == null) {
            throw new IllegalArgumentException("User information is required.");
        }

        UserProfile existingProfile = userProfileRepository.findByUserUserId(userProfile.getUser().getUserId());
        if (existingProfile != null) {
            existingProfile.setFirstName(userProfile.getFirstName());
            existingProfile.setLastName(userProfile.getLastName());
            existingProfile.setPhoneNumber(userProfile.getPhoneNumber());
            return userProfileRepository.save(existingProfile);
        } else {
            userProfile.setUser(userRepository.findById(userProfile.getUser().getUserId()).orElseThrow(
                () -> new RuntimeException("User not found")));
            return userProfileRepository.save(userProfile);
        }
    }

    public UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserUserId(userId);
    }
}