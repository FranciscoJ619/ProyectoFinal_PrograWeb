package com.replayclub.api.controller;

import com.replayclub.api.domain.EstadoFisico;
import com.replayclub.api.domain.EstadoPublicacion;
import com.replayclub.api.domain.Modalidad;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoCardDto;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoDetalleDto;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoRequest;
import com.replayclub.api.security.UsuarioPrincipal;
import com.replayclub.api.service.VideojuegoFiltro;
import com.replayclub.api.service.VideojuegoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videojuegos")
public class VideojuegoController {

    private final VideojuegoService videojuegoService;

    public VideojuegoController(VideojuegoService videojuegoService) {
        this.videojuegoService = videojuegoService;
    }

    /**
     * Catálogo. Los filtros viajan como query params y se aplican en la base de datos.
     * Ej: /api/videojuegos?q=zelda&plataformaIds=5&modalidad=PRESTAMO&estadosFisicos=NUEVO&orden=populares&page=0&size=8
     */
    @GetMapping
    public PageResponse<VideojuegoCardDto> catalogo(
            @RequestParam(required = false) @Size(max = 100) String q,
            @RequestParam(required = false) List<Long> plataformaIds,
            @RequestParam(required = false) Long generoId,
            @RequestParam(required = false) Modalidad modalidad,
            @RequestParam(required = false) List<EstadoFisico> estadosFisicos,
            @RequestParam(required = false) Long propietarioId,
            @RequestParam(defaultValue = "false") boolean incluirPrestados,
            @RequestParam(defaultValue = "recientes") String orden,
            @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
            @RequestParam(defaultValue = "8") @Min(1) @Max(48) int size) {
        List<EstadoPublicacion> estados = incluirPrestados
                ? List.of(EstadoPublicacion.PUBLICADO, EstadoPublicacion.PRESTADO)
                : List.of(EstadoPublicacion.PUBLICADO);
        var filtro = new VideojuegoFiltro(q, plataformaIds, generoId, modalidad, estadosFisicos, propietarioId, estados);
        return videojuegoService.buscar(filtro, page, size, orden);
    }

    /** Mis publicaciones (incluye borradores, prestados y vendidos). */
    @GetMapping("/mios")
    public PageResponse<VideojuegoCardDto> mios(@AuthenticationPrincipal UsuarioPrincipal yo,
                                                @RequestParam(required = false) EstadoPublicacion estado,
                                                @RequestParam(required = false) String q,
                                                @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                                @RequestParam(defaultValue = "8") @Min(1) @Max(48) int size) {
        var filtro = new VideojuegoFiltro(q, null, null, null, null, yo.getId(), estado == null ? null : List.of(estado));
        return videojuegoService.buscar(filtro, page, size, "recientes");
    }

    @GetMapping("/{id}")
    public VideojuegoDetalleDto detalle(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return videojuegoService.detalle(id, yo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VideojuegoDetalleDto crear(@Valid @RequestBody VideojuegoRequest req, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return videojuegoService.crear(req, yo);
    }

    @PutMapping("/{id}")
    public VideojuegoDetalleDto actualizar(@PathVariable Long id, @Valid @RequestBody VideojuegoRequest req,
                                           @AuthenticationPrincipal UsuarioPrincipal yo) {
        return videojuegoService.actualizar(id, req, yo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        videojuegoService.eliminar(id, yo);
    }
}
