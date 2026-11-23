package com.replayclub.api.controller;

import com.replayclub.api.domain.EstadoSolicitud;
import com.replayclub.api.domain.TipoSolicitud;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.SolicitudDtos.SolicitudDto;
import com.replayclub.api.service.SolicitudService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/solicitudes")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSolicitudController {

    private final SolicitudService solicitudService;

    public AdminSolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public PageResponse<SolicitudDto> listar(@RequestParam(required = false) String q,
                                             @RequestParam(required = false) EstadoSolicitud estado,
                                             @RequestParam(required = false) TipoSolicitud tipo,
                                             @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                             @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return solicitudService.todas(q, estado, tipo, Paginacion.de(page, size, Sort.by(Sort.Order.desc("fechaSolicitud"))));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        solicitudService.eliminar(id);
    }
}
