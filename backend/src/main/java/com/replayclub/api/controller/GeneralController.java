package com.replayclub.api.controller;

import com.replayclub.api.dto.AuthDtos.MensajeResponse;
import com.replayclub.api.dto.ComunDtos.*;
import com.replayclub.api.security.UsuarioPrincipal;
import com.replayclub.api.service.ArchivoService;
import com.replayclub.api.service.EstadisticasService;
import com.replayclub.api.service.NotificacionService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Notificaciones, estadísticas y subida de imágenes. */
@RestController
@RequestMapping("/api")
public class GeneralController {

    private final NotificacionService notificacionService;
    private final EstadisticasService estadisticasService;
    private final ArchivoService archivoService;

    public GeneralController(NotificacionService notificacionService, EstadisticasService estadisticasService,
                             ArchivoService archivoService) {
        this.notificacionService = notificacionService;
        this.estadisticasService = estadisticasService;
        this.archivoService = archivoService;
    }

    // ------------------------------------------------------------------ notificaciones

    @GetMapping("/notificaciones")
    public PageResponse<NotificacionDto> notificaciones(@AuthenticationPrincipal UsuarioPrincipal yo,
                                                        @RequestParam(defaultValue = Paginacion.PAGE_DEFAULT) @Min(0) int page,
                                                        @RequestParam(defaultValue = "8") @Min(1) @Max(50) int size) {
        return notificacionService.listar(yo.getId(), Paginacion.de(page, size, Sort.by(Sort.Order.desc("fechaCreacion"))));
    }

    @GetMapping("/notificaciones/no-leidas")
    public ConteoNotificacionesDto noLeidas(@AuthenticationPrincipal UsuarioPrincipal yo) {
        return notificacionService.contarNoLeidas(yo.getId());
    }

    @PatchMapping("/notificaciones/{id}/leida")
    public MensajeResponse marcarLeida(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal yo) {
        notificacionService.marcarLeida(id, yo.getId());
        return new MensajeResponse("Notificación marcada como leída");
    }

    @PatchMapping("/notificaciones/leer-todas")
    public MensajeResponse leerTodas(@AuthenticationPrincipal UsuarioPrincipal yo) {
        notificacionService.marcarTodasLeidas(yo.getId());
        return new MensajeResponse("Todas las notificaciones fueron marcadas como leídas");
    }

    // ------------------------------------------------------------------ estadísticas

    @GetMapping("/estadisticas")
    public EstadisticasDto estadisticas() {
        return estadisticasService.generales();
    }

    @GetMapping("/admin/estadisticas")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminEstadisticasDto estadisticasAdmin() {
        return estadisticasService.admin();
    }

    // ------------------------------------------------------------------ archivos

    @PostMapping(value = "/archivos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ArchivoDto subir(@RequestParam("archivo") MultipartFile archivo) {
        return archivoService.guardar(archivo);
    }
}
