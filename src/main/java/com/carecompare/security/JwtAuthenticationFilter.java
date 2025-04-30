package com.carecompare.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.carecompare.model.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter implements Ordered {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, jakarta.servlet.ServletException {
        final String requestURI = request.getRequestURI();
        final String authHeader = request.getHeader("Authorization");
        
        
        if (isPublicEndpoint(requestURI)) {
            logger.debug("Public endpoint accessed: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }
        
        logger.debug("Processing request to: {}", requestURI);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No JWT token found in request to: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }
        
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                logger.debug("JWT token found for user: {}", username);
                
                // Load our custom user entity, which implements UserDetails
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (jwtUtil.validateToken(token, userDetails)) {
                    logger.debug("Valid JWT token for user: {}", username);
                    
                    // Create authentication token with our custom User entity
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    logger.debug("User successfully authenticated: {}", username);
                    
                    // Log the authenticated user for debugging
                    if (userDetails instanceof User) {
                        User user = (User) userDetails;
                        logger.debug("User ID from authentication: {}", user.getId());
                    }
                } else {
                    logger.warn("Invalid JWT token for user: {}", username);
                }
            }
        } catch (Exception e) {
            logger.error("JWT token processing error", e);
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/api/auth") || 
               requestURI.startsWith("/api/symptom-checker") ||
               requestURI.startsWith("/api/appointments/debug");
    }
    
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE - 100;
    }
}