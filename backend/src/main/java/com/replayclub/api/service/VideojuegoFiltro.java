package com.replayclub.api.service;

import com.replayclub.api.domain.EstadoFisico;
import com.replayclub.api.domain.EstadoPublicacion;
import com.replayclub.api.domain.Modalidad;

import java.util.List;

/**
 * Filtros del catálogo recibidos como query params.
 *
 * @param q              texto a buscar en el título
 * @param plataformaIds  plataformas seleccionadas
 * @param generoId       género
 * @param modalidad      VENTA incluye AMBAS; PRESTAMO incluye AMBAS; AMBAS solo AMBAS
 * @param estadosFisicos estados físicos seleccionados
 * @param propietarioId  solo los de un usuario (perfil público)
 * @param estados        estados de publicación permitidos
 */
public record VideojuegoFiltro(String q, List<Long> plataformaIds, Long generoId, Modalidad modalidad,
                               List<EstadoFisico> estadosFisicos, Long propietarioId,
                               List<EstadoPublicacion> estados) {
}
