package com.carecompare.util;

import java.security.Key;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        // Generate a strong secret key for tests
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String strongSecret = java.util.Base64.getEncoder().encodeToString(key.getEncoded());

        // Initialize JwtUtil with secure key
        jwtUtil = new JwtUtil(strongSecret);
    }

    @Test
    void testGenerateToken() {
        String token = jwtUtil.generateToken("test@example.com");
        assertNotNull(token);
    }

    @Test
    void testValidateToken_Valid() {
        String token = jwtUtil.generateToken("test@example.com");
        assertTrue(jwtUtil.validateToken(token, "test@example.com"));
    }

    @Test
    void testValidateToken_Invalid() {
        String token = jwtUtil.generateToken("test@example.com");
        assertFalse(jwtUtil.validateToken(token, "invalid@example.com"));
    }

    @Test
    void testExtractEmail() {
        String token = jwtUtil.generateToken("test@example.com");
        String email = jwtUtil.extractEmail(token);
        assertEquals("test@example.com", email);
    }
}
