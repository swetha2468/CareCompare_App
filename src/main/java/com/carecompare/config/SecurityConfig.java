package com.carecompare.config;

import com.carecompare.security.JwtAuthenticationFilter;
import com.carecompare.security.JwtUtil;
import com.carecompare.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    @Autowired
    private CorsFilter corsFilter;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {}) // Use the CorsFilter directly
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests
                    .requestMatchers(new AntPathRequestMatcher("/swagger-ui.html"),
                                     new AntPathRequestMatcher("/v3/api-docs/**"),
                                     new AntPathRequestMatcher("/swagger-ui/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/auth/**"),
                                     new AntPathRequestMatcher("/api/symptom-checker/**"),
                                     new AntPathRequestMatcher("/api/docs/**"),
                                     new AntPathRequestMatcher("/api/appointments/debug/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/dashboard/**"),
                                     new AntPathRequestMatcher("/api/profile/**"),
                                     new AntPathRequestMatcher("/api/treatment/**"),
                                     new AntPathRequestMatcher("/api/appointments/**")).authenticated()
                    .anyRequest().permitAll()
            )
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(jwtAuthenticationFilter(), CorsFilter.class);

        return http.build();
    }
}