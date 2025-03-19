package com.carecompare.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc; 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional 
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; 

    private User testUser;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        userRepository.deleteAll(); //  Clear previous test data to avoid duplicates
    
        User newUser = new User(); // Changed name from testUser to newUser
        newUser.setName("Test User");
        newUser.setEmail("test" + System.currentTimeMillis() + "@example.com"); //  Unique Email
        newUser.setPassword(passwordEncoder.encode("password"));
    
        userRepository.save(newUser);
    }

    @Test
    public void testLoginUser_Success() throws Exception {
        // Create test user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password")); // Ensure it's hashed
        userRepository.save(testUser);

        // Ensure the request payload matches the expected format
        String loginRequestJson = """
            {
                "email": "test@example.com",
                "password": "password"
            }
        """;

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequestJson))  
                .andExpect(status().isOk());
    }

}
