package com.replayclub.api.controller;

import com.replayclub.api.domain.CategoriaForo;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.ForoDtos.*;
import com.replayclub.api.security.UsuarioPrincipal;
import com.replayclub.api.service.ForoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foro")
public class ForoController {

    private final ForoService foroService;

    public ForoController(ForoService foroService) {
        this.foroService = foroService;
    }

    @GetMapping("/publicaciones")
    public PageResponse<PublicacionDto> listar(@RequestParam(required = false) CategoriaForo categoria,
                                               @RequestParam(required = false) String q,
                                               @RequestParam(required = false) Long videojuegoId,
                                               @RequestParam(required = false) Long usuarioValoradoId,
                                               @RequestParam(required = false) Long autorId,
                                               @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                               @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return foroService.listar(categoria, q, videojuegoId, usuarioValoradoId, autorId,
                Paginacion.de(page, size, Sort.by(Sort.Order.desc("fechaCreacion"))));
    }

    @GetMapping("/publicaciones/{id}")
    public PublicacionDto detalle(@PathVariable Long id) {
        return foroService.detalle(id);
    }

    @PostMapping("/publicaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public PublicacionDto crear(@Valid @RequestBody PublicacionRequest req, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return foroService.crear(req, yo);
    }

    @DeleteMapping("/publicaciones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        foroService.eliminar(id, yo);
    }

    @GetMapping("/publicaciones/{id}/comentarios")
    public PageResponse<ComentarioDto> comentarios(@PathVariable Long id,
                                                   @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                                   @RequestParam(defaultValue = Paginacion.SIZE_DEFAULT) @Min(1) @Max(50) int size) {
        return foroService.comentarios(id, Paginacion.de(page, size, Sort.by(Sort.Order.asc("fechaCreacion"))));
    }

    @PostMapping("/publicaciones/{id}/comentarios")
    @ResponseStatus(HttpStatus.CREATED)
    public ComentarioDto comentar(@PathVariable Long id, @Valid @RequestBody ComentarioRequest req,
                                  @AuthenticationPrincipal UsuarioPrincipal yo) {
        return foroService.comentar(id, req, yo);
    }

    @DeleteMapping("/comentarios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarComentario(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        foroService.eliminarComentario(id, yo);
    }

    @GetMapping("/temas-populares")
    public List<TemaPopularDto> temasPopulares() {
        return foroService.temasPopulares();
    }
}
