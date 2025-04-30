package com.carecompare.config;

import java.util.List;

import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * This class is disabled and should not be used.
 * All CORS configuration is now handled by WebMvcConfig.java, which is marked as @Primary.
 * This class is kept for reference purposes only.
 */
// @Configuration - Commented out to disable this configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure JSON message converter to ensure proper JSON serialization
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // Add Jackson converter explicitly to ensure it's available
        converters.add(new MappingJackson2HttpMessageConverter());
    }
} 