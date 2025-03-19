package com.carecompare.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.carecompare.model.User;
import com.carecompare.repository.UserRepository;
import com.carecompare.util.JwtUtil;

public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;  // Mock PasswordEncoder

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, passwordEncoder, jwtUtil);
    }

    @Test
    void testRegisterUser_Success() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("plaintextpassword");
        user.setName("Test User");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(user.getPassword())).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User registeredUser = userService.registerUser(user);

        assertNotNull(registeredUser);
        assertEquals("hashedpassword", registeredUser.getPassword()); // Ensure password is hashed
    }

    @Test
    void testAuthenticateUser_Success() {
        String email = "test@example.com";
        String rawPassword = "plaintextpassword";
        String hashedPassword = "hashedpassword";

        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPassword(hashedPassword);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true);
        when(jwtUtil.generateToken(email)).thenReturn("mockJwtToken");

        String token = userService.authenticateUser(email, rawPassword);
        
        assertNotNull(token);
        assertEquals("mockJwtToken", token);
    }

    @Test
    void testAuthenticateUser_Failure_WrongPassword() {
        String email = "test@example.com";
        String rawPassword = "wrongpassword";
        String hashedPassword = "hashedpassword";

        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPassword(hashedPassword);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(false);

        String token = userService.authenticateUser(email, rawPassword);
        
        assertNull(token); // Authentication should fail
    }

    @Test
    void testAuthenticateUser_Failure_UserNotFound() {
        String email = "test@example.com";
        String rawPassword = "plaintextpassword";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        String token = userService.authenticateUser(email, rawPassword);
        
        assertNull(token); // User not found, authentication fails
    }
}
