package com.replayclub.api.dto;

import com.replayclub.api.dto.UsuarioDtos.UsuarioDto;
import com.replayclub.api.validation.Patrones;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Ingresa un correo válido")
            String email,

            @NotBlank(message = "La contraseña es obligatoria")
            String password) {
    }

    public record RegistroRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
            String nombre,

            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Ingresa un correo válido")
            @Size(max = 150, message = "El correo no puede exceder 150 caracteres")
            String email,

            @NotBlank(message = "La contraseña es obligatoria")
            @Pattern(regexp = Patrones.PASSWORD, message = Patrones.PASSWORD_MSG)
            String password,

            @NotBlank(message = "El teléfono es obligatorio para avisarte por SMS y WhatsApp")
            @Pattern(regexp = Patrones.TELEFONO, message = Patrones.TELEFONO_MSG)
            String telefono,

            @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
            String ciudad) {
    }

    public record AuthResponse(String token, String tipo, long expiraEnMs, UsuarioDto usuario) {
    }

    public record OlvidePasswordRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Ingresa un correo válido")
            String email) {
    }

    public record RestablecerPasswordRequest(
            @NotBlank(message = "El token es obligatorio")
            String token,

            @NotBlank(message = "La contraseña es obligatoria")
            @Pattern(regexp = Patrones.PASSWORD, message = Patrones.PASSWORD_MSG)
            String password) {
    }

    public record CambiarPasswordRequest(
            @NotBlank(message = "Ingresa tu contraseña actual")
            String actual,

            @NotBlank(message = "La nueva contraseña es obligatoria")
            @Pattern(regexp = Patrones.PASSWORD, message = Patrones.PASSWORD_MSG)
            String nueva) {
    }

    public record MensajeResponse(String mensaje) {
    }
}
