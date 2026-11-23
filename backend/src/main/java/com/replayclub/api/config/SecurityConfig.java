package com.replayclub.api.config;

import com.replayclub.api.security.JsonSecurityHandlers;
import com.replayclub.api.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JsonSecurityHandlers jsonHandlers;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, JsonSecurityHandlers jsonHandlers) {
        this.jwtFilter = jwtFilter;
        this.jsonHandlers = jsonHandlers;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint(jsonHandlers).accessDeniedHandler(jsonHandlers))
                .authorizeHttpRequests(auth -> auth
                        // Públicos
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/registro",
                                "/api/auth/olvide-password", "/api/auth/restablecer-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        // Panel de administración
                        .requestMatchers("/api/admin/usuarios/**", "/api/admin/solicitudes/**",
                                "/api/admin/estadisticas").hasRole("ADMIN")
                        .requestMatchers("/api/admin/videojuegos/**").hasAnyRole("ADMIN", "MODERADOR")
                        .requestMatchers(HttpMethod.POST, "/api/plataformas/**", "/api/generos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/plataformas/**", "/api/generos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/plataformas/**", "/api/generos/**").hasRole("ADMIN")
                        // Publicar y solicitar juegos: solo jugadores (y el admin)
                        .requestMatchers(HttpMethod.POST, "/api/videojuegos", "/api/solicitudes").hasAnyRole("JUGADOR", "ADMIN")
                        // Todo lo demás requiere sesión
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
