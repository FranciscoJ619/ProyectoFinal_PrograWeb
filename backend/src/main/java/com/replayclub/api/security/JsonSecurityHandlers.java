package com.replayclub.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/** Respuestas JSON para 401 y 403 generados por Spring Security (antes de llegar al controlador). */
@Component
public class JsonSecurityHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex)
            throws IOException {
        escribir(response, request, 401, "Unauthorized", "Necesitas iniciar sesión o tu sesión expiró");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        escribir(response, request, 403, "Forbidden", "No tienes permisos para acceder a este recurso");
    }

    private void escribir(HttpServletResponse response, HttpServletRequest request, int status, String error,
                          String mensaje) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String json = """
                {"timestamp":"%s","status":%d,"error":"%s","message":"%s","path":"%s","errores":null}"""
                .formatted(LocalDateTime.now(), status, error, mensaje, request.getRequestURI().replace("\"", ""));
        response.getWriter().write(json);
    }
}
