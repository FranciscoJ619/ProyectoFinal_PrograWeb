package com.replayclub.api.controller;

import com.replayclub.api.dto.AuthDtos.CambiarPasswordRequest;
import com.replayclub.api.dto.AuthDtos.MensajeResponse;
import com.replayclub.api.dto.UsuarioDtos.*;
import com.replayclub.api.security.UsuarioPrincipal;
import com.replayclub.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public UsuarioDto yo(@AuthenticationPrincipal UsuarioPrincipal yo) {
        return usuarioService.yo(yo.getId());
    }

    @PutMapping("/me")
    public UsuarioDto actualizarPerfil(@AuthenticationPrincipal UsuarioPrincipal yo,
                                       @Valid @RequestBody PerfilUpdateRequest req) {
        return usuarioService.actualizarPerfil(yo.getId(), req);
    }

    @PutMapping("/me/password")
    public MensajeResponse cambiarPassword(@AuthenticationPrincipal UsuarioPrincipal yo,
                                           @Valid @RequestBody CambiarPasswordRequest req) {
        usuarioService.cambiarPassword(yo.getId(), req);
        return new MensajeResponse("Contraseña actualizada correctamente");
    }

    @GetMapping("/{id}")
    public PerfilPublicoDto perfil(@PathVariable Long id) {
        return usuarioService.perfilPublico(id);
    }

    /** Envía un mensaje al usuario por notificación, correo y WhatsApp. */
    @PostMapping("/{id}/contactar")
    public MensajeResponse contactar(@AuthenticationPrincipal UsuarioPrincipal yo, @PathVariable Long id,
                                     @Valid @RequestBody ContactoRequest req) {
        usuarioService.contactar(yo, id, req);
        return new MensajeResponse("Mensaje enviado. Le avisamos por correo y WhatsApp");
    }
}
