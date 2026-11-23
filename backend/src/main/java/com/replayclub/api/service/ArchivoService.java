package com.replayclub.api.service;

import com.replayclub.api.dto.ComunDtos.ArchivoDto;
import com.replayclub.api.exception.ReglaNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/** Guarda imágenes (fotos de juegos y avatares) en el disco del servidor. */
@Service
public class ArchivoService {

    private static final Map<String, String> TIPOS = Map.of(
            "image/jpeg", ".jpg", "image/png", ".png", "image/webp", ".webp");
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Path directorio;

    public ArchivoService(@Value("${app.uploads.dir}") String dir) throws IOException {
        this.directorio = Path.of(dir).toAbsolutePath().normalize();
        Files.createDirectories(directorio);
    }

    public ArchivoDto guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw ReglaNegocioException.campo("archivo", "Selecciona una imagen");
        }
        String extension = TIPOS.get(archivo.getContentType());
        if (extension == null) {
            throw ReglaNegocioException.campo("archivo", "Solo se permiten imágenes JPG, PNG o WEBP");
        }
        if (archivo.getSize() > MAX_BYTES) {
            throw ReglaNegocioException.campo("archivo", "La imagen excede el tamaño máximo de 5 MB");
        }
        String nombre = UUID.randomUUID() + extension;
        try (InputStream in = archivo.getInputStream()) {
            Files.copy(in, directorio.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar la imagen", e);
        }
        return new ArchivoDto("/api/uploads/" + nombre);
    }
}
