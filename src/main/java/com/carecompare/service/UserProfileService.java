package com.carecompare.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carecompare.model.UserProfile;
import com.carecompare.repository.UserProfileRepository;

@Service
public class UserProfileService {
    @Autowired
    private UserProfileRepository userProfileRepository;

    public UserProfile findById(Long id) {
        Optional<UserProfile> profile = userProfileRepository.findById(id);
        return profile.orElse(null);
    }

    public List<UserProfile> findAll() {
        return userProfileRepository.findAll();
    }

    public UserProfile save(UserProfile userProfile) {
        return userProfileRepository.save(userProfile);
    }

    public void delete(Long id) {
        userProfileRepository.deleteById(id);
    }

    public UserProfile findByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId).orElse(null);
    }

    public UserProfile updateProfile(Long id, UserProfile userProfile) {
        userProfile.setId(id);
        return userProfileRepository.save(userProfile);
    }

    public void deleteProfile(Long id) {
        delete(id);
    }
}