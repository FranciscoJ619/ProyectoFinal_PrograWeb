package com.replayclub.api.controller;

import com.replayclub.api.dto.AuthDtos.*;
import com.replayclub.api.security.JwtAuthenticationFilter;
import com.replayclub.api.service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registro(@Valid @RequestBody RegistroRequest req) {
        return authService.registro(req);
    }

    /** Invalida el JWT enviado en el header Authorization. */
    @PostMapping("/logout")
    public MensajeResponse logout(@RequestAttribute(name = JwtAuthenticationFilter.ATTR_CLAIMS, required = false) Claims claims) {
        authService.logout(claims);
        return new MensajeResponse("Sesión cerrada correctamente");
    }

    @PostMapping("/olvide-password")
    public MensajeResponse olvidePassword(@Valid @RequestBody OlvidePasswordRequest req) {
        authService.olvidePassword(req);
        return new MensajeResponse("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña");
    }

    @PostMapping("/restablecer-password")
    public MensajeResponse restablecer(@Valid @RequestBody RestablecerPasswordRequest req) {
        authService.restablecerPassword(req);
        return new MensajeResponse("Tu contraseña se actualizó. Ya puedes iniciar sesión");
    }
}
