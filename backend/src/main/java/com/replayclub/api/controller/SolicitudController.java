package com.replayclub.api.controller;

import com.replayclub.api.domain.EstadoSolicitud;
import com.replayclub.api.domain.TipoSolicitud;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.SolicitudDtos.*;
import com.replayclub.api.security.UsuarioPrincipal;
import com.replayclub.api.service.SolicitudService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Préstamos (renta) y compras entre jugadores. */
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    /** rol = TODOS | SOLICITANTE | PROPIETARIO */
    @GetMapping
    public PageResponse<SolicitudDto> mias(@AuthenticationPrincipal UsuarioPrincipal yo,
                                           @RequestParam(defaultValue = "TODOS") String rol,
                                           @RequestParam(required = false) EstadoSolicitud estado,
                                           @RequestParam(required = false) TipoSolicitud tipo,
                                           @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                           @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return solicitudService.mias(yo.getId(), rol, estado, tipo,
                Paginacion.de(page, size, Sort.by(Sort.Order.desc("fechaSolicitud"))));
    }

    @GetMapping("/resumen")
    public ResumenSolicitudesDto resumen(@AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.resumen(yo.getId());
    }

    @GetMapping("/opinables")
    public List<TransaccionOpinableDto> opinables(@AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.opinables(yo.getId());
    }

    @GetMapping("/{id}")
    public SolicitudDto detalle(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.detalle(id, yo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitudDto crear(@Valid @RequestBody SolicitudRequest req, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.crear(req, yo);
    }

    @PatchMapping("/{id}/aprobar")
    public SolicitudDto aprobar(@PathVariable Long id, @Valid @RequestBody(required = false) RespuestaRequest req,
                                @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.aprobar(id, req, yo);
    }

    @PatchMapping("/{id}/rechazar")
    public SolicitudDto rechazar(@PathVariable Long id, @Valid @RequestBody(required = false) RespuestaRequest req,
                                 @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.rechazar(id, req, yo);
    }

    @PatchMapping("/{id}/cancelar")
    public SolicitudDto cancelar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.cancelar(id, yo);
    }

    @PatchMapping("/{id}/entregar")
    public SolicitudDto entregar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.entregar(id, yo);
    }

    @PatchMapping("/{id}/confirmar-devolucion")
    public SolicitudDto confirmarDevolucion(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return solicitudService.confirmarDevolucion(id, yo);
    }
}
