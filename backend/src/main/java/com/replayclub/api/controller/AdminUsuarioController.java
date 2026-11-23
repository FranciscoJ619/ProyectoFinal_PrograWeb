package com.replayclub.api.controller;

import com.replayclub.api.domain.RolNombre;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.UsuarioDtos.*;
import com.replayclub.api.security.UsuarioPrincipal;
import com.replayclub.api.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final UsuarioService usuarioService;

    public AdminUsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public PageResponse<UsuarioDto> listar(@RequestParam(required = false) String q,
                                           @RequestParam(required = false) RolNombre rol,
                                           @RequestParam(required = false) Boolean activo,
                                           @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                           @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return usuarioService.listar(q, rol, activo, Paginacion.de(page, size, Sort.by("id")));
    }

    @GetMapping("/{id}")
    public UsuarioDto obtener(@PathVariable Long id) {
        return usuarioService.yo(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto crear(@Valid @RequestBody AdminUsuarioCrearRequest req) {
        return usuarioService.crear(req);
    }

    @PutMapping("/{id}")
    public UsuarioDto actualizar(@PathVariable Long id, @Valid @RequestBody AdminUsuarioActualizarRequest req,
                                 @AuthenticationPrincipal UsuarioPrincipal admin) {
        return usuarioService.actualizar(id, req, admin);
    }

    @PatchMapping("/{id}/activo")
    public UsuarioDto cambiarActivo(@PathVariable Long id, @Valid @RequestBody ActivoRequest req,
                                    @AuthenticationPrincipal UsuarioPrincipal admin) {
        return usuarioService.cambiarActivo(id, req.activo(), admin);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal admin) {
        usuarioService.eliminar(id, admin);
    }
}
