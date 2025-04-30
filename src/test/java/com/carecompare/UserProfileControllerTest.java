package com.carecompare;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.carecompare.controller.UserProfileController;
import com.carecompare.model.UserProfile;
import com.carecompare.service.UserProfileService;

public class UserProfileControllerTest {

    @InjectMocks
    private UserProfileController userProfileController;

    @Mock
    private UserProfileService userProfileService;

    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userProfileController).build();
    }

    @Test
    public void testGetProfile() throws Exception {
        UserProfile userProfile = new UserProfile();
        userProfile.setId(1L);
        when(userProfileService.findById(anyLong())).thenReturn(userProfile);

        mockMvc.perform(get("/api/profile/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    public void testCreateProfile() throws Exception {
        UserProfile userProfile = new UserProfile();
        userProfile.setId(1L);
        when(userProfileService.save(any(UserProfile.class))).thenReturn(userProfile);

        mockMvc.perform(post("/api/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    public void testUpdateProfile() throws Exception {
        UserProfile userProfile = new UserProfile();
        userProfile.setId(1L);
        userProfile.setFirstName("Test"); // Use firstName instead of name
        userProfile.setLastName("User");  // Use lastName instead of name
        when(userProfileService.updateProfile(anyLong(), any(UserProfile.class))).thenReturn(userProfile);

        mockMvc.perform(put("/api/profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":1,\"firstName\":\"Test\",\"lastName\":\"User\"}")) // Match entity fields
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("User"));
    }

    @Test
    public void testDeleteProfile() throws Exception {
        doNothing().when(userProfileService).deleteProfile(anyLong());

        mockMvc.perform(delete("/api/profile/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}