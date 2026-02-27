package com.example.OMA.SecurityConfig;

import com.example.OMA.Security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;


@Configuration
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, Authorization headers)
        config.setAllowCredentials(true);
        
        // Get allowed origins from environment variable or use defaults
        String originsEnv = System.getenv("ALLOWED_ORIGINS");
        if (originsEnv != null && !originsEnv.isEmpty()) {
            // Trim spaces around origins
            String[] origins = originsEnv.split(",");
            for (int i = 0; i < origins.length; i++) {
                origins[i] = origins[i].trim();
            }
            config.setAllowedOrigins(Arrays.asList(origins));
        } else {
            // Default for local development
            config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
            ));
        }
        
        // Allow these HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow ALL request headers (this is safest for CORS)
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose these headers in the response
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        
        // Cache preflight results for 1 hour
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf
                .disable()
            )
            // Stateless JWT authentication
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/survey/survey_score").authenticated()
                .requestMatchers("/api/survey/test-auth").authenticated()
                .requestMatchers("/api/survey/**").permitAll()
                .requestMatchers("/api/category/**").permitAll()
                .requestMatchers("/api/credential/**").permitAll()
                .anyRequest().denyAll()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
