package com.replayclub.api.service;

import com.replayclub.api.domain.Genero;
import com.replayclub.api.domain.Plataforma;
import com.replayclub.api.dto.CatalogoDtos.*;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.exception.RecursoNoEncontradoException;
import com.replayclub.api.exception.ReglaNegocioException;
import com.replayclub.api.repository.GeneroRepository;
import com.replayclub.api.repository.PlataformaRepository;
import com.replayclub.api.repository.VideojuegoRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** CRUD de plataformas y géneros (catálogos administrados por el ADMIN). */
@Service
public class CatalogoService {

    private final PlataformaRepository plataformaRepository;
    private final GeneroRepository generoRepository;
    private final VideojuegoRepository videojuegoRepository;

    public CatalogoService(PlataformaRepository plataformaRepository, GeneroRepository generoRepository,
                           VideojuegoRepository videojuegoRepository) {
        this.plataformaRepository = plataformaRepository;
        this.generoRepository = generoRepository;
        this.videojuegoRepository = videojuegoRepository;
    }

    // ------------------------------------------------------------------ plataformas

    @Transactional(readOnly = true)
    public List<PlataformaDto> todasPlataformas() {
        return plataformaRepository.findAll(Sort.by("id")).stream().map(DtoMapper::plataforma).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<PlataformaDto> paginaPlataformas(String q, Pageable pageable) {
        return PageResponse.of(plataformaRepository.findByNombreContainingIgnoreCase(q == null ? "" : q.trim(), pageable),
                DtoMapper::plataforma);
    }

    @Transactional
    public PlataformaDto crearPlataforma(PlataformaRequest req) {
        if (plataformaRepository.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw ReglaNegocioException.campo("nombre", "Ya existe una plataforma con ese nombre");
        }
        Plataforma p = new Plataforma();
        p.setNombre(req.nombre().trim());
        p.setFabricante(req.fabricante().trim());
        return DtoMapper.plataforma(plataformaRepository.save(p));
    }

    @Transactional
    public PlataformaDto actualizarPlataforma(Long id, PlataformaRequest req) {
        Plataforma p = plataformaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Plataforma", id));
        if (plataformaRepository.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw ReglaNegocioException.campo("nombre", "Ya existe una plataforma con ese nombre");
        }
        p.setNombre(req.nombre().trim());
        p.setFabricante(req.fabricante().trim());
        return DtoMapper.plataforma(p);
    }

    @Transactional
    public void eliminarPlataforma(Long id) {
        Plataforma p = plataformaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Plataforma", id));
        if (videojuegoRepository.countByPlataformaId(id) > 0) {
            throw new ReglaNegocioException("No se puede eliminar: hay videojuegos publicados en esta plataforma");
        }
        plataformaRepository.delete(p);
    }

    // ------------------------------------------------------------------ géneros

    @Transactional(readOnly = true)
    public List<GeneroDto> todosGeneros() {
        return generoRepository.findAll(Sort.by("nombre")).stream().map(DtoMapper::genero).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<GeneroDto> paginaGeneros(String q, Pageable pageable) {
        return PageResponse.of(generoRepository.findByNombreContainingIgnoreCase(q == null ? "" : q.trim(), pageable),
                DtoMapper::genero);
    }

    @Transactional
    public GeneroDto crearGenero(GeneroRequest req) {
        if (generoRepository.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw ReglaNegocioException.campo("nombre", "Ya existe un género con ese nombre");
        }
        Genero g = new Genero();
        g.setNombre(req.nombre().trim());
        return DtoMapper.genero(generoRepository.save(g));
    }

    @Transactional
    public GeneroDto actualizarGenero(Long id, GeneroRequest req) {
        Genero g = generoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Género", id));
        if (generoRepository.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw ReglaNegocioException.campo("nombre", "Ya existe un género con ese nombre");
        }
        g.setNombre(req.nombre().trim());
        return DtoMapper.genero(g);
    }

    @Transactional
    public void eliminarGenero(Long id) {
        Genero g = generoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Género", id));
        if (videojuegoRepository.countByGeneroId(id) > 0) {
            throw new ReglaNegocioException("No se puede eliminar: hay videojuegos con este género");
        }
        generoRepository.delete(g);
    }
}
