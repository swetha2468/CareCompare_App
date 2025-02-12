package com.carecompare.config;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.carecompare.util.JwtUtil;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SecurityException; 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter: Intercepts requests to validate JWT tokens.
 * Ensures only authenticated users access secured resources.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    /**
     * Constructor-based dependency injection for JwtUtil.
     * 
     * @param jwtUtil Utility class for generating and validating JWT tokens.
     */
    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Filters requests to validate JWT tokens before processing them.
     *
     * @param request  Incoming HTTP request.
     * @param response HTTP response.
     * @param filterChain Next filter in the chain.
     * @throws ServletException If a servlet error occurs.
     * @throws IOException If an input or output error occurs.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        String jwtToken = null;
        String userEmail = null;

        try {
            // Extract JWT token from Authorization header
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwtToken = authHeader.substring(7); // Remove "Bearer " prefix
                userEmail = jwtUtil.extractEmail(jwtToken); // Extract user email from token
            }

            // If userEmail is extracted and authentication is not yet set
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Create a dummy UserDetails object (JWT contains user email, no password is needed)
                UserDetails userDetails = User.withUsername(userEmail).password("").roles("USER").build();

                // Validate the token before setting authentication
                if (jwtUtil.validateToken(jwtToken, userEmail)) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in the security context
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }

        } catch (ExpiredJwtException e) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "JWT Token has expired");
            return;
        } catch (SecurityException | MalformedJwtException e) {  
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid JWT Token");
            return;
        } catch (UnsupportedJwtException e) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unsupported JWT Token");
            return;
        } catch (IllegalArgumentException e) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "JWT claims string is empty");
            return;
        }

        // Proceed with the request if JWT is valid
        filterChain.doFilter(request, response);
    }
}
