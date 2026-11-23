package com.replayclub.api.controller;

import com.replayclub.api.dto.CatalogoDtos.*;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.service.CatalogoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Plataformas y géneros. Lectura para cualquier usuario autenticado; escritura solo ADMIN. */
@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    // ------------------------------------------------------------------ plataformas

    @GetMapping("/plataformas/todas")
    public List<PlataformaDto> todasPlataformas() {
        return catalogoService.todasPlataformas();
    }

    @GetMapping("/plataformas")
    public PageResponse<PlataformaDto> plataformas(@RequestParam(required = false) String q,
                                                   @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                                   @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return catalogoService.paginaPlataformas(q, Paginacion.de(page, size, Sort.by("id")));
    }

    @PostMapping("/plataformas")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PlataformaDto crearPlataforma(@Valid @RequestBody PlataformaRequest req) {
        return catalogoService.crearPlataforma(req);
    }

    @PutMapping("/plataformas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PlataformaDto actualizarPlataforma(@PathVariable Long id, @Valid @RequestBody PlataformaRequest req) {
        return catalogoService.actualizarPlataforma(id, req);
    }

    @DeleteMapping("/plataformas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarPlataforma(@PathVariable Long id) {
        catalogoService.eliminarPlataforma(id);
    }

    // ------------------------------------------------------------------ géneros

    @GetMapping("/generos/todos")
    public List<GeneroDto> todosGeneros() {
        return catalogoService.todosGeneros();
    }

    @GetMapping("/generos")
    public PageResponse<GeneroDto> generos(@RequestParam(required = false) String q,
                                           @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                           @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return catalogoService.paginaGeneros(q, Paginacion.de(page, size, Sort.by("nombre")));
    }

    @PostMapping("/generos")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public GeneroDto crearGenero(@Valid @RequestBody GeneroRequest req) {
        return catalogoService.crearGenero(req);
    }

    @PutMapping("/generos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public GeneroDto actualizarGenero(@PathVariable Long id, @Valid @RequestBody GeneroRequest req) {
        return catalogoService.actualizarGenero(id, req);
    }

    @DeleteMapping("/generos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarGenero(@PathVariable Long id) {
        catalogoService.eliminarGenero(id);
    }
}
