package com.carecompare.config;

import java.io.IOException;
import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
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

    private final UserDetailsService userDetailsService; // Load user details

    // ✅ Define a Secure Key for JWT (MUST be 256 bits or more)
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(
        Base64.getDecoder().decode("YJks38ds09skS9dq0382asShNksdm923MSD8asdlkq02893sadasdjklqw82")
    );

    // JWT Expiration Time (1 Day)
    private static final long EXPIRATION_TIME = 86400000;

    /**
     * Constructor-based dependency injection for UserDetailsService.
     *
     * @param userDetailsService Service to fetch user details from DB.
     */
    public JwtAuthFilter(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Generates JWT Token using SECRET_KEY.
     * 
     * @param email User's email.
     * @return JWT Token.
     */
    public static String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // ✅ FIXED
                .compact();
    }

    /**
     * Validates JWT Token.
     * 
     * @param token JWT Token.
     * @return `true` if valid, else `false`.
     */
    public static boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts User Email from JWT Token.
     * 
     * @param token JWT Token.
     * @return User's email.
     */
    public static String getUserEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
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
                userEmail = getUserEmailFromToken(jwtToken); // Extract user email from token
            }

            // If userEmail is extracted and authentication is not yet set
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // Validate the token before setting authentication
                if (validateToken(jwtToken)) {
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
