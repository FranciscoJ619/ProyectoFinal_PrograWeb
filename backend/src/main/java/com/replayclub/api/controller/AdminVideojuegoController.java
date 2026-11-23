package com.replayclub.api.controller;

import com.replayclub.api.domain.EstadoPublicacion;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.VideojuegoDtos.EstadoPublicacionRequest;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoCardDto;
import com.replayclub.api.service.VideojuegoFiltro;
import com.replayclub.api.service.VideojuegoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Moderación de publicaciones: ADMIN y MODERADOR. */
@RestController
@RequestMapping("/api/admin/videojuegos")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
public class AdminVideojuegoController {

    private final VideojuegoService videojuegoService;

    public AdminVideojuegoController(VideojuegoService videojuegoService) {
        this.videojuegoService = videojuegoService;
    }

    @GetMapping
    public PageResponse<VideojuegoCardDto> listar(@RequestParam(required = false) String q,
                                                  @RequestParam(required = false) EstadoPublicacion estado,
                                                  @RequestParam(required = false) Long plataformaId,
                                                  @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                                  @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        var filtro = new VideojuegoFiltro(q, plataformaId == null ? null : List.of(plataformaId), null, null, null, null,
                estado == null ? null : List.of(estado));
        return videojuegoService.buscar(filtro, page, size, "recientes");
    }

    @PatchMapping("/{id}/estado")
    public VideojuegoCardDto moderar(@PathVariable Long id, @Valid @RequestBody EstadoPublicacionRequest req) {
        return videojuegoService.moderar(id, req.estado());
    }
}
