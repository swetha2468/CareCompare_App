package com.carecompare.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    @Value("${jwt.secret:your-secret-key}") 
    private String secret;
    
    @Value("${jwt.expiration:604800000}") 
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration:1209600000}") 
    private long refreshExpiration;

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username) {
        return generateToken(username, jwtExpiration);
    }
    
    public String generateRefreshToken(String username) {
        return generateToken(username, refreshExpiration);
    }
    
    private String generateToken(String username, long expiration) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String refreshToken(String token) {
        try {
            String username = extractUsername(token);
            if (validateToken(token)) {
                return generateToken(username);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public String refreshToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            if (validateToken(token, userDetails)) {
                return generateToken(username);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public Date getExpirationDate(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return !getExpirationDate(token).before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !getExpirationDate(token).before(new Date()));
    }
}