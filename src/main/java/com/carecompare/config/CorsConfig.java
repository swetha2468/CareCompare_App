package com.carecompare.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS filter configuration that works together with WebMvcConfig.
 * This provides a CorsFilter bean for use with Spring Security.
 * For MVC endpoints, WebMvcConfig takes precedence.
 */
@Configuration
public class CorsConfig {

    /**
     * Creates a CorsFilter bean to be used by Spring Security.
     * Note: This works WITH WebMvcConfig, not against it.
     */
    @Bean
    @Primary
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfiguration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Accept", "Accept-Encoding", 
            "X-Requested-With", "Origin", "Access-Control-Request-Method", 
            "Access-Control-Request-Headers"
        ));
        corsConfiguration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", 
            "Content-Type", "Content-Length"
        ));
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        
        return new CorsFilter(source);
    }
} 